import React from "react"
import { Icons } from "components/Icons"
import { LoadingSpinner, ActionsBar, SelectableList, QRReader } from "components"
import { hasAdmin } from "core/permissions"
import moment from "moment"
import classnames from "classnames"
import fuse from "fuse.js"

import { Select, Result, Button, Modal, Tag, Badge, Input } from "antd"

import { WorkloadCreator, WorkloadDetails } from "./components"

import "./index.less"

const { Option } = Select

const api = window.app.apiBridge

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

export default class Workload extends React.Component {
	state = {
		loading: true,
		workloads: null,
		regions: [],
		selectedRegion: 0,
		selectionEnabled: false,
		searchValue: null,
	}

	componentDidMount = async () => {
		await api.get
			.regions()
			.then((data) => {
				this.setState({ regions: data })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err })
			})

		this.loadWorkloadsFromRegion(this.state.selectedRegion)
	}

	loadWorkloadsFromRegion = async (id) => {
		this.setState({ loading: true })

		await api.get
			.workloads({ regionId: id }, { regionId: id })
			.then((data) => {
				console.log(data)
				this.setState({ workloads: data, loading: false })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err })
			})
	}

	createNewWorkload = () => {
		window.controllers.drawer.open("workload_creator", WorkloadCreator, {
			props: {
				width: "55%",
			},
			onDone: (drawer) => {
				drawer.close()
			},
		})
	}

	openWorkloadDetails = (id) => {
		if (this.state.selectionEnabled) {
			return false
		}

		//TODO: Open workload details drawer
		console.log("Opening workload drawer...")

		window.controllers.drawer.open("workload_details", WorkloadDetails, {
			componentProps: {
				id,
			},
			props: {
				width: "85%",
			},
			onDone: (drawer) => {
				drawer.close()
			},
		})
	}

	onChangeRegion = (regionId) => {
		console.log("SelectedRegion >",regionId)
		this.setState({ selectedRegion: regionId }, async () => {
			await this.loadWorkloadsFromRegion(regionId)
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
							this.reloadWorkloads()
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
		this.reloadWorkloads()
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

		console.log(result)

		this.setState({
			searchValue: result.map((entry) => {
				return entry.item
			}),
		})
	}

	renderRegionsOptions = () => {
		return this.state.regions.map((region) => {
			return (
				<Option key={region.id} value={region.id}>
					{region.data.name}
				</Option>
			)
		})
	}

	renderAdminActions = () => {
		if (!hasAdmin()) {
			return null
		}
		return [
			<div key="new_workload">
				<Button type="primary" onClick={this.createNewWorkload} icon={<Icons.Plus />}>
					New Workload
				</Button>
			</div>,
		]
	}

	toogleSelection = () => {
		this.setState({ selectionEnabled: !this.state.selectionEnabled })
	}

	renderWorkloadItem = (item) => {
		const isExpired = moment().isAfter(moment(item.scheduledFinish, "DD:MM:YYYY hh:mm"))

		if (isExpired) {
			item.status = "expired"
		}

		return (
			<div className="workload_order_item" onClick={() => this.openWorkloadDetails(item._id)} key={item._id}>
				<div className="header">
					<div className={classnames("indicator", item.status)}>
						<div className="statusText">{item.status}</div>
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
						{item.items.length} items
					</div>
				</div>
			</div>
		)
	}

	renderWorkloads = (list) => {
		return (
			<SelectableList
				selectionEnabled={this.state.selectionEnabled}
				actions={[
					<div key="delete" call="onDelete">
						<Icons.Trash />
						Delete
					</div>,
				]}
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
				renderItem={this.renderWorkloadItem}
			></SelectableList>
		)
	}

	render() {
		if (this.state.loading) {
			return <LoadingSpinner />
		}
		return (
			<div>
				<div style={{ marginBottom: "10px" }}>
					<ActionsBar wrapperStyle={this.state.selectionEnabled ? { justifyContent: "center" } : null}>
						<div>
							<Button
								onClick={this.toogleSelection}
								icon={this.state.selectionEnabled ? <Icons.Check /> : <Icons.MousePointer />}
							>
								{this.state.selectionEnabled ? "Done" : "Select"}
							</Button>
						</div>

						<div>
							<Button onClick={QRReader.openModal}>Scan QR</Button>
						</div>

						<div>
							<Input.Search placeholder="Search" allowClear onSearch={this.onSearch} onChange={this.onSearch} />
						</div>

						{!this.state.selectionEnabled && (
							<div>
								<Select
									key="region_select"
									showSearch
									style={{ width: 200 }}
									placeholder="Select a region"
									optionFilterProp="children"
									onChange={this.onChangeRegion}
									value={this.state.selectedRegion}
									filterOption={(input, option) =>
										option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
								>
									{this.renderRegionsOptions()}
								</Select>
							</div>
						)}

						{!this.state.selectionEnabled && this.renderAdminActions()}
					</ActionsBar>
				</div>

				{this.state.workloads.length === 0 && (
					<Result icon={<Icons.SmileOutlined />} title="Great, there are no more workloads" />
				)}

				{this.renderWorkloads(this.state.searchValue ?? this.state.workloads)}
			</div>
		)
	}
}
