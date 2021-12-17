import React from "react"
import * as antd from "antd"
import moment from "moment"
import classnames from "classnames"
import { debounce } from "lodash"
import fuse from "fuse.js"

import { Icons } from "components/Icons"
import { ActionsBar, SelectableList, Workload } from "components"

import "./index.less"

const dateFormat = "DD-MM-YYYY hh:mm"

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

export default class Workloads extends React.Component {
	state = {
		loading: true,
		regions: [],
		selectionEnabled: false,
		selectedRegion: "all",
		searchValue: null,
		workloads: null,
	}

	api = window.app.request

	componentDidMount = async () => {
		this.loadRegions()
		this.fetchWorkloadsFromRegion(this.state.selectedRegion)
	}

	loadRegions = async () => {
		await this.api.get.regions()
			.then((data) => {
				this.setState({ regions: data })
			})
			.catch((error) => {
				console.error(error)
				this.setState({ error })
			})
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

		await this.api.get.workloads(undefined, { region: id })
			.then((data) => {
				console.log(data)
				this.setState({ workloads: data, loading: false })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err, loading: false })
			})
	}

	openWorkloadDetails = (id) => {
		if (this.state.selectionEnabled) {
			return false
		}

		window.app.openWorkloadDetails(id)
	}

	openWorkloadCreator = () => {
		window.app.DrawerController.open("workload_creator", Workload.Creator, {
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
		antd.Modal.confirm({
			title: "Do you want to delete these items?",
			icon: <Icons.ExclamationCircleOutlined />,
			content: keys.map((key) => {
				return <div>{key}</div>
			}),
			onOk: () => {
				return new Promise((resolve, reject) => {
					this.api.delete
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

	search = (value) => {
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

	debouncedSearch = debounce((value) => this.search(value), 500)

	onSearch = (event) => {
		if (event === "" && this.state.searchValue) {
			return this.setState({ searchValue: null })
		}

		this.debouncedSearch(event.target.value)
	}

	renderRegionsOptions = () => {
		return this.state.regions.map((region) => {
			return (
				<antd.Select.Option key={region.name} value={region.name}>
					{region.name}
				</antd.Select.Option>
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
					{!window.isMobile && <div>
						<antd.Tag>{item._id}</antd.Tag>
					</div>}
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
			return <antd.Result icon={<Icons.SmileOutlined />} title="Great, there are no more workloads" />
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
				renderItem={this.renderItem}
				items={list}
			/>
		)
	}

	render() {
		return (
			<div style={{ height: "100%" }}>
				<div style={{ marginBottom: "10px" }}>
					<ActionsBar float={true}>
						<div key="refresh">
							<antd.Button icon={<Icons.RefreshCcw style={{ margin: 0 }} />} shape="circle" onClick={this.componentDidMount} />
						</div>
						<div key="toogleSelection">
							<antd.Button
								shape="round"
								icon={this.state.selectionEnabled ? <Icons.Check /> : <Icons.MousePointer />}
								type={this.state.selectionEnabled ? "default" : "primary"}
								onClick={() => this.toogleSelection()}
							>
								{this.state.selectionEnabled ? "Done" : "Select"}
							</antd.Button>
						</div>
						<div key="createNew">
							<antd.Button type="primary" onClick={this.openWorkloadCreator} icon={<Icons.Plus />}>
								New
							</antd.Button>
						</div>
						<div key="search">
							<antd.Input.Search
								placeholder="Search"
								allowClear
								onSearch={this.onSearch}
								onChange={this.onSearch}
							/>
						</div>
						<div key="regionSelection">
							<antd.Select
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
								<antd.Select.Option key="all" value="all">
									All regions
								</antd.Select.Option>
								{this.renderRegionsOptions()}
							</antd.Select>
						</div>
					</ActionsBar>
				</div>

				{this.state.loading ? <antd.Skeleton active /> : this.renderWorkloads(this.state.searchValue ?? this.state.workloads)}
			</div>
		)
	}
}