import React from "react"
import { Icons } from "components/Icons"
import { nanoid } from "nanoid"

import { LoadingSpinner } from "components"
import { Select, Button, List, Tag, Space } from "antd"

import { WorkloadSelector } from "../index"

import "../../index.less"

const { Option } = Select

const api = window.app.apiBridge

function craftFabricObject({ obj, props, quantity = 1 }) {
	const defaultKeys = {
		cost: 0,
		timeSpend: 0,
	}

	let craft = {
		...defaultKeys,
		...obj,
	}

	// generate uuid
	craft.uuid = nanoid()

	// parse object
	if (typeof obj !== "undefined") {
		craft.quantity = quantity

		if (typeof props !== "undefined" && Array.isArray(props)) {
			// add selected Props to craft
			craft.selectedProps = props

			// iterate props
			props.forEach((propKey) => {
				const _prop = obj.props[propKey]

				if (typeof _prop !== "undefined") {
					// calculate time spends
					if (typeof _prop.timeSpend === "number") {
						craft.timeSpend = (craft.timeSpend + _prop.timeSpend) * quantity
					}

					// calculate cost
					if (typeof _prop.cost === "number") {
						craft.cost = (craft.cost + _prop.cost) * quantity
					}
				}
			})
		}

		return craft
	} else {
		throw new Error("Invalid item, not found")
	}
}

const ActionIcon = (props) => (
	<Space style={{ cursor: 'pointer' }} onClick={props.onClick}>
		{React.createElement(props.icon)}
		{props.text}
	</Space>
)

export default class WorkloadCreator extends React.Component {
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
			return <Option key={region.id} value={region.id}>{region.data.name}</Option>
		})
	}

	addItem = () => {
		window.controllers.drawer.open("workload_item_selector", WorkloadSelector, {
			props: {
				width: "65%",
			},
			onDone: (drawer, load) => {
				drawer.close()

				const craft = craftFabricObject(load)
				const { items } = this.state

				items.push(craft)

				this.setState({ items })
			},
		})
	}

	removeItem = (uuid) => {
		this.setState({ items: this.state.items.filter((item) => item.uuid !== uuid) })
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
						itemLayout="vertical"
						size="large"
						renderItem={(item) => (
							<List.Item
								key={item.id}
								actions={[
									<ActionIcon
										onClick={() => {
											this.removeItem(item.uuid)
										}}
										icon={Icons.Trash}
										text="Remove"
										key="remove"
									/>,
									<ActionIcon icon={Icons.Edit} text="Modify" key="modify" />,
								]}
							>
								<List.Item.Meta
									title={
										<a>
											x{item.quantity?? 1} | {item.title} <Tag>{item.id}</Tag>
										</a>
									}
									description={item.description}
								/>
								<div className="workload_item_props">
									{(item.selectedProps ?? []).map((propKey) => {
										const prop = item.props[propKey]
										return (
											<div>
												<Icons.Check />
												{prop.title}
											</div>
										)
									})}
								</div>
							</List.Item>
						)}
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
