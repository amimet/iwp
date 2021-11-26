import React from "react"
import { Icons } from "components/Icons"
import { ActionsBar, SelectableList, QRReader } from "components"
import moment from "moment"
import classnames from "classnames"
import fuse from "fuse.js"

import { Select, Result, Button, Modal, Tag, Skeleton, Input } from "antd"

import { WorkloadCreator, WorkloadDetails } from "./components"

import "./index.less"

const { Option } = Select

const dateFormat = "DD-MM-YYYY hh:mm"

const api = window.app.request

const renderDate = (time) => {
	const dateNumber = Number(time)

	if (dateNumber) {
		const date = new Date(dateNumber)
		return [
			<div>
				<Icons.Clock /> {date.toLocaleTimeString()}
			</div>,
			<div>
				<Icons.Calendar /> {date.toLocaleDateString()}
			</div>,
		]
	}
	return (
		<div>
			<div>
				<Icons.Clock /> {time}
			</div>
		</div>
	)
}

class Workload extends React.Component {
	state = {
		loading: true,
		regions: [],
		selectionEnabled: false,
		selectedRegion: "all",
		searchValue: null,
		workloads: null,
	}

	componentDidMount = async () => {
		await api.get
			.regions()
			.then((data) => {
				this.setState({ regions: data })
			})
			.catch((error) => {
				console.error(error)
				this.setState({ error })
			})

		this.fetchWorkloadsFromRegion(this.state.selectedRegion)

		if (typeof window.app.debug !== "undefined") {
			window.app.debug.bind("workload_list", this)
		}
	}

	componentWillUnmount = () => {
		if (typeof window.app.debug !== "undefined") {
			window.app.debug.unbind("workload_list", this)
		}
	}

	toogleSelection = () => {
		this.setState({ selectionEnabled: !this.state.selectionEnabled })
	}

	appendWorkloadToRender = (payload) => {
		let query = []
		let workloads = this.state.workloads ?? []

		if (Array.isArray(payload)) {
			query = payload
		} else {
			query.push(payload)
		}

		query.forEach((_payload) => {
			workloads.push(_payload)
		})

		this.setState({ workloads })
	}

	deleteWorkloadFromRender = (id) => {
		let query = []
		let workloads = this.state.workloads

		if (Array.isArray(id)) {
			query = id
		} else {
			query.push(id)
		}

		workloads = workloads.filter((workload) => !id.includes(workload._id))

		this.setState({ workloads })
	}

	fetchWorkloadsFromRegion = async (id) => {
		this.setState({ loading: true })

		await api.get
			.workloads({ region: id }, { region: id })
			.then((data) => {
				console.log(data)
				this.setState({ workloads: data, loading: false })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err })
			})
	}

	openWorkloadDetails = (id) => {
		if (this.state.selectionEnabled) {
			return false
		}

		window.app.DrawerController.open("workload_details", WorkloadDetails, {
			componentProps: {
				id,
			},
			props: {
				width: "fit-content",
			},
			onDone: (drawer) => {
				drawer.close()
			},
		})
	}

	openWorkloadCreator = () => {
		window.app.DrawerController.open("workload_creator", WorkloadCreator, {
			props: {
				width: "55%",
			},
			onDone: (drawer, payload) => {
				this.changeRegion(payload.region)
			}
		})
	}

	changeRegion = (region) => {
		this.setState({ selectedRegion: region }, async () => {
			await this.fetchWorkloadsFromRegion(region)
		})
	}

	onDeleteWorkloads = (keys) => {
		Modal.confirm({
			title: "Do you want to delete these items?",
			icon: <Icons.ExclamationCircleOutlined />,
			content: keys.map((key) => {
				return <div>{key}</div>
			}),
			onOk: () => {
				return new Promise((resolve, reject) => {
					api.delete
						.workload({ id: keys })
						.then(() => {
							this.deleteWorkloadFromRender(keys)
							this.toogleSelection(false)
							return resolve()
						})
						.catch((err) => {
							return reject(err)
						})
				})
			},
		})
	}

	onCheckWorkloads = (keys) => {
		console.log(keys)
	}

	onSearch = (value) => {
		if (typeof value !== "string") {
			if (typeof value.target?.value === "string") {
				value = value.target.value
			}
		}

		if (value === "") {
			return this.setState({ searchValue: null })
		}

		const searcher = new fuse(this.state.workloads, {
			includeScore: true,
			keys: ["name", "_id"],
		})
		const result = searcher.search(value)

		this.setState({
			searchValue: result.map((entry) => {
				return entry.item
			}),
		})
	}

	renderRegionsOptions = () => {
		return this.state.regions.map((region) => {
			return (
				<Option key={region.name} value={region.name}>
					{region.name}
				</Option>
			)
		})
	}

	renderItem = (item) => {
		if (typeof item.scheduledFinish !== "undefined") {
			const now = moment().format(dateFormat)

			const isExpired = moment(item.scheduledFinish, dateFormat).isBefore(moment(now, dateFormat))

			if (isExpired) {
				item.expired = true
			}
		}

		const indicatorStatus = item.expired ? "expired" : item.status

		return (
			<div className="workload_order_item" onClick={() => this.openWorkloadDetails(item._id)} >
				<div className="header">
					<div className={classnames("indicator", indicatorStatus)}>
						<div className="statusText">{indicatorStatus}</div>
					</div>
					<div>
						<h1>{item.name ?? "Unnamed workload"}</h1>
					</div>
					<div>
						<Tag>{item._id}</Tag>
					</div>
				</div>
				<div className="info">
					{renderDate(item.created)}
					<div>
						<Icons.Box />
						{item.items?.length} items
					</div>
				</div>
			</div>
		)
	}

	renderWorkloads = (list) => {
		const actions = []

		// TODO: Fetch user permissions and check if user has permission to delete
		actions.push(
			<div key="delete" call="onDelete">
				<Icons.Trash />
				Delete
			</div>,
		)

		if (list.length === 0) {
			return <Result icon={<Icons.SmileOutlined />} title="Great, there are no more workloads" />
		}

		return (
			<SelectableList
				selectionEnabled={this.state.selectionEnabled}
				actions={actions}
				onDoneRender={
					<>
						<Icons.Check /> Check
					</>
				}
				onDone={(value) => {
					console.log(value)
				}}
				onDelete={this.onDeleteWorkloads}
				onCheck={this.onCheckWorkloads}
				items={list}
				renderItem={this.renderItem}
			></SelectableList>
		)
	}

	render() {
		return (
			<div>
				<div style={{ marginBottom: "10px" }}>
					<ActionsBar float={true}>
						<div key="createNew">
							<Button type="primary" onClick={this.openWorkloadCreator} icon={<Icons.Plus />}>
								New
							</Button>
						</div>
						<div key="toogleSelection">
							<Button
								onClick={this.toogleSelection}
								icon={this.state.selectionEnabled ? <Icons.Check /> : <Icons.MousePointer />}
							>
								{this.state.selectionEnabled ? "Done" : "Select"}
							</Button>
						</div>
						<div key="search">
							<Input.Search
								placeholder="Search"
								allowClear
								onSearch={this.onSearch}
								onChange={this.onSearch}
							/>
						</div>
						<div key="regionSelection">
							<Select
								key="region_select"
								showSearch
								style={{ width: 200 }}
								placeholder="Select a region"
								optionFilterProp="children"
								onChange={this.changeRegion}
								value={this.state.selectedRegion}
								filterOption={(input, option) =>
									option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
								}
							>
								<Option key="all" value="all">
									All regions
								</Option>
								{this.renderRegionsOptions()}
							</Select>
						</div>
					</ActionsBar>
				</div>

				{this.state.loading ? <Skeleton active /> : this.renderWorkloads(this.state.searchValue ?? this.state.workloads)}
			</div>
		)
	}
}

export default Workload