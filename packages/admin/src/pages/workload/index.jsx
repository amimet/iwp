import React from "react"
import { Icons } from "components/Icons"

import { LoadingSpinner, ActionsBar, SelectableList } from "components"
import { hasAdmin } from "core/permissions"

import { Select, Result, Button, Modal } from "antd"

const { Option } = Select

const api = window.app.apiBridge

let mockFabricDB = [
	{
		key: "pantalon_test",
		title: "Pantalon TEST (MARCA)",
		description: "Pantalon basico, prueba",
		cost: 20,
		timeSpend: 4000, // on seconds
		props: {
			color_white: {},
			bolsillo_basico: {
				description: "Bolsillo (100x100 Profundidad)",
				timeSpend: 1000,
			},
			buttons: {
				timeSpend: 2400,
				cost: 5,
			},
		},
	},
]

function craftFabricObject(db, id, props) {
	const obj = db[id]

	const defaultKeys = {
		cost: 0,
		timeSpend: 0,
	}

	let craft = {
		...defaultKeys,
		...obj,
	}

	// removed invalid properties
	delete craft["props"]

	// parse object
	if (typeof obj !== "undefined") {
		if (typeof props !== "undefined" && Array.isArray(props)) {
			// add selected Props to craft
			craft.selectedProps = props

			// iterate props
			props.forEach((propKey) => {
				const _prop = obj.props[propKey]

				if (typeof _prop !== "undefined") {
					// calculate time spends
					if (typeof _prop.timeSpend === "number") {
						craft.timeSpend += _prop.timeSpend
					}

					// calculate cost
					if (typeof _prop.cost === "number") {
						craft.cost += _prop.cost
					}
				}
			})
		}

		return craft
	} else {
		throw new Error("Invalid item, not found")
	}
}

class WorkloadItemsSelector extends React.Component {
	state = {
		loading: true,
		items: [],
	}

	componentDidMount = async () => {
		let items = []

		// TODO: collect all items from API


		//mock data
		items = mockFabricDB

		//update state
		this.setState({
			items: [...this.state.items, ...items],
			loading: false,
		})
	}

	handleDone = (keys) => {
		if (typeof this.props.onDone === "function") {
			this.props.onDone(keys)
		}
	}

	render() {
		if (this.state.loading) return <LoadingSpinner />
		return (
			<div>
				<SelectableList
					onDone={this.handleDone}
					data={this.state.items.map((item) => {
						return {
							key: item.key,
							render: (
								<div key={item.key}>
									{item.name} {item.description}
								</div>
							),
						}
					})}
				/>
			</div>
		)
	}
}

class WorkloadCreator extends React.Component {
	state = {
		selectedRegion: null,
		regions: [],
		items: [],
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

	generateRegionsOption = () => {
		return this.state.regions.map((region) => {
			return <Option value={region.id}>{region.data.name}</Option>
		})
	}

	addItem = () => {
		this.setState({ loading: true })
		window.controllers.drawer.open("workload_item_selector", WorkloadItemsSelector, {
			props: {
				width: "65%",
			},
			onDone: (drawer, context) => {
				drawer.close()
				this.setState({ items: [...this.state.items, ...context], loading: false })
				this.forceUpdate()
			},
		})
	}

	create = () => {}

	render() {
		if (this.state.loading) return <LoadingSpinner />

		return (
			<div>
				<div>
					<h2>
						<Icons.GitCommit /> Create new Workload
					</h2>
				</div>

				<div style={{ marginBottom: "20px" }}>
					<Select
						showSearch
						style={{ width: "100%" }}
						placeholder="Select a region"
						optionFilterProp="children"
						onChange={(region) => {
							this.setState({ selectedRegion: region })
						}}
						filterOption={(input, option) =>
							option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
					>
						{this.generateRegionsOption()}
					</Select>
				</div>

				<div>
					<List 
						dataSource={this.state.items}
					/>
				</div>
				<Button onClick={this.addItem}>Add item</Button>

				<div className="component_bottom_centered" style={{ paddingBottom: "30px" }}>
					<Button type="primary" onClick={this.create}>
						Create
					</Button>
				</div>
			</div>
		)
	}
}

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
								width: "45%",
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
