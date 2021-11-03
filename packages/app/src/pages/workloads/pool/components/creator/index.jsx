import React from "react"
import { Icons } from "components/Icons"
import { nanoid } from "nanoid"

import { Select, Button, List, Tag, Space, Input, DatePicker, Tabs, Row, Col } from "antd"
import { LoadingSpinner } from "components"

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
	<Space style={{ cursor: "pointer" }} onClick={props.onClick}>
		{React.createElement(props.icon)}
		{props.text}
	</Space>
)

export default class WorkloadCreator extends React.Component {
	state = {
		name: null,
		selectedDate: null,
		selectedRegion: null,
		selectedWorkshift: null,
		regions: [],
		items: [],
		workshifts: {},
	}

	componentDidMount = async () => {
		this.props.events.on("create_error", (error) => {
			this.setState({ submitting: false, submittingError: error })
		})

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

	addItem = () => {
		window.app.DrawerController.open("workload_item_selector", WorkloadSelector, {
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

	submit = async () => {
		this.setState({ submitting: true, submittingError: null })

		const { selectedRegion, selectedWorkshift, selectedDate, items, name } = this.state

		const workload = {
			region: selectedRegion,
			workshift: selectedWorkshift,
			name,
			items,
		}

		if (selectedDate != null) {
			workload.scheduledStart = selectedDate[0]
			workload.scheduledFinish = selectedDate[1]
		}

		if (typeof this.props.onDone === "function") {
			return this.props.onDone(workload)
		}
	}

	generateRegionsOption = () => {
		return this.state.regions.map((region) => {
			return (
				<Option key={region.id} value={region.id}>
					{region.data.name}
				</Option>
			)
		})
	}

	renderWorkshiftsOptions = () => {
		return Object.keys(this.state.workshifts).map((key) => {
			const workshift = this.state.workshifts[key]
			return <Select.Option key={workshift._id}>{workshift.name}</Select.Option>
		})
	}

	renderWorkshiftInfo = (id) => {
		const workshift = this.state.workshifts[id]

		return (
			<div className="workload_workshift_info">
				<div>
					<Icons.LogIn style={{ color: "blue", marginRight: "10px" }} />
					{workshift.start}
				</div>
				<div>
					<Icons.ArrowRight />
				</div>
				<div>
					<Icons.LogOut style={{ color: "red", marginRight: "10px" }} />
					{workshift.end}
				</div>
			</div>
		)
	}

	getWorkshiftsFromRegion = async (region) => {
		const data = await api.get.workshifts(undefined, { regionId: region })
		const obj = Object()

		data.forEach((workshift) => {
			obj[workshift._id] = workshift
		})

		this.setState({ workshifts: obj })
	}

	onSelectRegion = (region) => {
		this.setState({ selectedRegion: region })
		this.getWorkshiftsFromRegion(region)
	}

	onSetSchedule = (value, dateString) => {
		this.setState({ selectedDate: dateString })
	}

	onSelectWorkshift = (key) => {
		this.setState({ selectedWorkshift: key })
	}

	onChangeName = (event) => {
		const value = event.target.value

		if (value === "") {
			this.setState({ name: null })
		} else {
			this.setState({ name: value })
		}
	}

	canSubmit = () => {
		const isRegionSet = this.state.selectedRegion !== null
		const isNameSet = this.state.name !== null

		return isRegionSet && isNameSet
	}

	render() {
		if (this.state.loading) return <LoadingSpinner />

		return (
			<div className="workload_creator_wrapper">
				<div>
					<h2>
						<Icons.GitCommit /> New Workload
					</h2>
				</div>

				<div key="region">
					<h4>
						<Icons.Globe /> Region
					</h4>
					<div className="body">
						<Select
							showSearch
							style={{ width: "100%" }}
							placeholder="Select a region"
							optionFilterProp="children"
							onChange={this.onSelectRegion}
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							{this.generateRegionsOption()}
						</Select>
					</div>
				</div>

				<div key="name">
					<h4>
						<Icons.Tag /> Name
					</h4>

					<div className="body">
						<Input placeholder="Order name" onChange={this.onChangeName} />
					</div>
				</div>

				<div key="workshift">
					<h4>
						<Icons.Clock /> Select a workshift
					</h4>
					<div className="body">
						{Object.keys(this.state.workshifts).length > 0 ? (
							<div className="workload_workshift_selector">
								<Select onChange={this.onSelectWorkshift} placeholder="Select an workshift">
									{this.renderWorkshiftsOptions()}
								</Select>
								{this.state.selectedWorkshift && this.renderWorkshiftInfo(this.state.selectedWorkshift)}
							</div>
						) : (
							<div style={{ textAlign: "center" }}>No workshifts available for this region</div>
						)}
					</div>
				</div>

				<div key="schedule">
					<h4>
						<Icons.Calendar /> Schedule
					</h4>

					<div className="body">
						<DatePicker.RangePicker
							showTime={{ format: "HH:mm" }}
							format="DD-MM-YYYY HH:mm"
							onChange={this.onSetSchedule}
						/>
					</div>
				</div>

				<div key="items">
					<Icons.List /> Items
					<div className="workload_creator_items">
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
												x{item.quantity ?? 1} | {item.title} <Tag>{item.id}</Tag>
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
					<div style={{ textAlign: "center" }}>{this.state.items.length} Items</div>
				</div>

				<Button onClick={this.addItem} type="primary" icon={<Icons.PlusCircle />}>
					Add item
				</Button>

				<div className="component_bottom_centered" style={{ paddingBottom: "30px" }}>
					<Button disabled={this.state.submitting || !this.canSubmit()} type="primary" onClick={this.submit}>
						{this.state.submitting && <Icons.LoadingOutlined spin />}
						Create
					</Button>
				</div>
				{this.state.submittingError && (
					<div className="component_bottom_centered" style={{ color: "#f5222d" }}>
						{this.state.submittingError}
					</div>
				)}
			</div>
		)
	}
}
