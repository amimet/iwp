import React from "react"
import { Icons } from "components/Icons"
import { LoadingSpinner, ActionsBar, SelectableList } from "components"
import { hasAdmin } from "core/permissions"

import { Select, Result, Button, Modal} from "antd"

import {  WorkloadCreator } from "./components"

import "./index.less"

const { Option } = Select

const api = window.app.apiBridge

export default class Workload extends React.Component {
	state = {
		loading: true,
		workloads: null,
		regions: [],
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
	}

	loadWorkloadsFromRegion = async (id) => {
		await api.get
			.workload(undefined, { region: id })
			.then((data) => {
				console.log(data)
				this.setState({ workloads: data, loading: false })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err })
			})
	}

	onChangeRegion = (regionId) => {
		this.loadWorkloadsFromRegion(regionId)
	}

	renderWorkloads() {
		if (this.state.workloads != null) {
			if (!Array.isArray(this.state.workloads)) {
				return <div>Invalid</div>
			}

			if (this.state.workloads.length === 0) {
				return <Result icon={<Icons.SmileOutlined />} title="Great, there are no more workloads" />
			}

			return <div></div>
		}

		return <LoadingSpinner />
	}

	generateRegionsOption = () => {
		return this.state.regions.map((region) => {
			return <Option value={region.id}>{region.data.name}</Option>
		})
	}

	renderAdminActions = () => {
		return [
			<div>
				<Button
					type="primary"
					onClick={() => {
						window.controllers.drawer.open("workload_creator", WorkloadCreator, {
							props: {
								width: "55%",
							},
						})
					}}
					icon={<Icons.Plus />}
				>
					New Workload
				</Button>
			</div>,
		]
	}

	onDeleteWorkloads = (keys) => {
		console.log(keys)
		Modal.confirm({
			title: "Do you want to delete these items?",
			icon: <Icons.ExclamationCircleOutlined />,
			content: keys.map((key) => {
				return <div>{key}</div>
			}),
			onOk() {
				return new Promise((resolve, reject) => {})
			},
			onCancel() {},
		})
	}

	onCheckWorkloads = (keys) => {
		console.log(keys)
	}

	render() {
		return (
			<div>
				<div style={{ marginBottom: "10px" }}>
					<ActionsBar>
						{hasAdmin() && this.renderAdminActions()}
						<Select
							showSearch
							style={{ width: 200 }}
							placeholder="Select a region"
							optionFilterProp="children"
							onChange={this.onChangeRegion}
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							{this.generateRegionsOption()}
						</Select>
					</ActionsBar>
				</div>

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
				>
					<div key="item3">Item 3 bruh</div>
					<div key="item4">Item 3 bruh</div>
				</SelectableList>

				{this.renderWorkloads()}
			</div>
		)
	}
}
