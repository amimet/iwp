import React from "react"
import { Icons } from "components/Icons"
import { LoadingSpinner, ActionsBar, SelectableList } from "components"
import { hasAdmin } from "core/permissions"

import { Select, Result, Button, Modal } from "antd"

import { WorkloadCreator } from "./components"

import "./index.less"

const { Option } = Select

const api = window.app.apiBridge

const renderDate = (time) => {
	const dateNumber = Number(time)

	if (dateNumber) {
		return new Date(dateNumber).toString()
	}
	return time
}

export default class Workload extends React.Component {
	state = {
		loading: true,
		workloads: null,
		regions: [],
		selectedRegion: null,
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

		this.reloadWorkloads()
	}

	reloadWorkloads() {
		this.setState({ loading: true })

		api.get.workloads(this.state.selectedRegion)
			.then((data) => {
				this.setState({
					loading: false,
					workloads: data,
				})
			})
			.catch((err) => {
				console.error(err)
				this.setState({
					err,
				})
			})
	}

	loadWorkloadsFromRegion = async (id) => {
		await api.get
			.workloads({ region: id })
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

	onChangeRegion = (regionId) => {
		this.setState({ selectedRegion: regionId })
		this.reloadWorkloads()
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
						.workload({id: keys})
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
		return [
			<div key="new_workload">
				<Button type="primary" onClick={this.createNewWorkload} icon={<Icons.Plus />}>
					New Workload
				</Button>
			</div>,
		]
	}

	renderWorkloads() {
		if (this.state.workloads != null) {
			if (!Array.isArray(this.state.workloads)) {
				return <div>Invalid</div>
			}

			if (this.state.workloads.length === 0) {
				return <Result icon={<Icons.SmileOutlined />} title="Great, there are no more workloads" />
			}

			return (
				<SelectableList
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
					items={this.state.workloads}
					renderItem={(item) => {
						return (
							<div key={item._id}>
								<div>{item._id}</div>
								<div>
									<Icons.Clock /> {renderDate(item.created)}
								</div>
							</div>
						)
					}}
				></SelectableList>
			)
		}

		return <LoadingSpinner />
	}

	render() {
		return (
			<div>
				<div style={{ marginBottom: "10px" }}>
					<ActionsBar>
						{hasAdmin() && this.renderAdminActions()}
						<Select
							key="region_select"
							showSearch
							style={{ width: 200 }}
							placeholder="Select a region"
							optionFilterProp="children"
							onChange={this.onChangeRegion}
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							{this.renderRegionsOptions()}
						</Select>
					</ActionsBar>
				</div>

				{this.renderWorkloads()}
			</div>
		)
	}
}
