import React from "react"
import * as antd from "antd"

import { Icons, createIconRender } from "components/Icons"
import { Fabric, ActionsBar, OperatorsAssignments } from "components"

import { OrdersRender } from ".."

import "./index.less"

const steps = [
	{
		title: "Name",
		icon: "Edit",
		content: (props) => {
			return <div className="workload_creator steps step content">
				<antd.Input placeholder="Input an name" onChange={props.onChangeName} />
			</div>
		},
	},
	{
		title: "Region",
		icon: "Globe",
		content: (props) => {
			return <div className="workload_creator steps step content">
				{props.renderRegionsSelector()}
			</div>
		},
	},
	{
		title: "Schedule",
		icon: "Calendar",
		content: (props) => {
			return <div className="workload_creator steps step content">
				<antd.DatePicker.RangePicker
					showTime={{ format: "HH:mm" }}
					format="DD-MM-YYYY HH:mm"
					onChange={props.onSetSchedule}
				/>
			</div>
		}
	},
	{
		title: "Workshift",
		icon: "Clock",
		content: (props) => {
			return <div className="workload_creator steps step content">
				{Object.keys(props.state.workshifts).length > 0 ? (
					<div className="workload_creator workshift">
						<antd.Select onChange={props.onSelectWorkshift} placeholder="Select an workshift">
							{props.renderWorkshiftsOptions()}
						</antd.Select>
						{props.state.selectedWorkshift && props.renderWorkshiftInfo(props.state.selectedWorkshift)}
					</div>
				) : (
					<div style={{ textAlign: "center" }}>No workshifts available for this region</div>
				)}
			</div>
		},
	},
	{
		title: "Operators",
		icon: "User",
		content: (props) => {
			return <div className="workload_creator steps step content">
				<OperatorsAssignments onAssignOperators={props.onAssignOperators} assigned={props.state.assigned} />
			</div>
		}
	},
	{
		title: "Orders",
		icon: "Box",
		content: (props) => {
			return <div className="workload_creator steps step content">
				<OrdersRender onDeleteItem={props.removeOrderItem} orders={props.state.orders} />

				<div key="actions" className="workload_creator steps step actions">
					<div key="add">
						<antd.Button onClick={props.onClickAddOrderItem} shape="round" icon={<Icons.Plus />}>
							Add
						</antd.Button>
					</div>
				</div>
			</div>
		}
	},
]

export default class WorkloadCreator extends React.Component {
	state = {
		step: 0,

		name: null,
		selectedDate: null,
		selectedRegion: null,
		selectedWorkshift: null,
		assigned: [],
		regions: [],
		orders: [],
		workshifts: {},
	}

	api = window.app.request

	componentDidMount = async () => {
		if (typeof this.props.events !== "undefined") {
			this.props.events.on("create_error", (error) => {
				this.handleError(error)
			})
		}

		await this.fetchRegions()
	}

	nextStep = () => {
		this.setState({ step: this.state.step + 1 })
	}

	prevStep = () => {
		this.setState({ step: this.state.step - 1 })
	}

	fetchRegions = async () => {
		await this.api.get
			.regions()
			.then((data) => {
				this.setState({ regions: data })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err })
			})
	}

	fetchWorkshiftsFromRegion = async (region) => {
		const data = await this.api.get.workshifts(undefined, { region: region })
		const obj = Object()

		data.forEach((workshift) => {
			obj[workshift._id] = workshift
		})

		this.setState({ workshifts: obj })
	}

	submit = async () => {
		this.setState({ submitting: true, submittingError: null })

		const { assigned, selectedRegion, selectedWorkshift, selectedDate, orders, name } = this.state

		const workload = {
			region: selectedRegion,
			workshift: selectedWorkshift,
			assigned: assigned,
			name,
			orders,
		}

		if (selectedDate != null) {
			workload.scheduledStart = selectedDate[0]
			workload.scheduledFinish = selectedDate[1]
		}

		const request = await this.api.put.workload(workload)
			.catch((error) => {
				this.handleError(error)
			})

		if (typeof this.props.handleDone === "function") {
			this.props.handleDone(request)
		}
		if (typeof this.props.close === "function") {
			this.props.close()
		}
	}

	handleError = (error) => {
		this.setState({ submitting: false, submittingError: error })
	}

	onClickAddOrderItem = () => {
		window.app.DrawerController.open("selector", Fabric.Selector, {
			onDone: (ctx, data) => {
				ctx.close()
				this.appendOrderItem(data)
			},
			props: {
				width: "65%",
			},
		})
	}

	appendOrderItem = (order) => {
		const { orders } = this.state

		orders.push(order)

		this.setState({ orders })
	}

	removeOrderItem = (id) => {
        //TODO: Remove with UUID
		this.setState({ orders: this.state.orders.filter((order) => order._id !== id) })
	}

	canSubmit = () => {
		const isRegionSet = this.state.selectedRegion !== null
		const isNameSet = this.state.name !== null
		const hasOrderItems = this.state.orders.length > 0

		return isRegionSet && isNameSet && hasOrderItems
	}

	onSelectRegion = (region) => {
		this.setState({ selectedRegion: region })
		this.fetchWorkshiftsFromRegion(region)
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

	onAssignOperators = (operators) => {
		let assigned = this.state.assigned
		assigned = [...assigned, ...operators]
		this.setState({ assigned })
	}

	renderRegionsSelector = () => {
		return <antd.Select
			showSearch
			placeholder="Select a region"
			optionFilterProp="children"
			onChange={this.onSelectRegion}
			filterOption={(input, option) =>
				option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
			}
			loading={this.state.regions > 0}
		>
			{this.state.regions.map((region) => {
				return <antd.Select.Option key={region.name} value={region.name}>
					{region.name}
				</antd.Select.Option>
			})}
		</antd.Select>
	}

	renderWorkshiftsOptions = () => {
		return Object.keys(this.state.workshifts).map((key) => {
			const workshift = this.state.workshifts[key]
			return <antd.Select.Option key={workshift._id}>{workshift.name}</antd.Select.Option>
		})
	}

	renderWorkshiftInfo = (id) => {
		const workshift = this.state.workshifts[id]

		return (
			<div className="workload_creator workshift info">
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

	renderStep = (step) => {
		const current = step ?? this.state.step
		let Element = steps[current].content

		if (React.isValidElement(Element)) {
			return <Element {...this} />
		}

		return React.createElement(Element, this)
	}

	render() {
		if (this.state.loading) return <antd.Skeleton active />
		const current = steps[this.state.step]
		return (
			<div className="workload_creator">
				<div className="workload_creator steps">
					<antd.Steps direction="vertical" className="workload_creator steps header" size="small" current={this.state.step}>
						{steps.map(item => (
							<antd.Steps.Step key={item.title} />
						))}
					</antd.Steps>

					<div className="workload_creator steps step">
						<h1>{current.icon && createIconRender(current.icon)}{current.title}</h1>
						{this.renderStep()}
					</div>
				</div>

				{this.state.submittingError && (
					<div className="component_bottom_centered" style={{ color: "#f5222d" }}>
						{this.state.submittingError}
					</div>
				)}

				<ActionsBar mode="float">
					{this.state.step > 0 && (
						<antd.Button style={{ margin: "0 8px" }} onClick={() => this.prevStep()}>
							<Icons.ChevronLeft />Previous
						</antd.Button>
					)}
					{this.state.step < steps.length - 1 && (
						<antd.Button type="primary" onClick={() => this.nextStep()}>
							<Icons.ChevronRight />Next
						</antd.Button>
					)}
					{this.state.step === steps.length - 1 && (
						<antd.Button disabled={this.state.submitting || !this.canSubmit()} type="primary" onClick={this.submit}>
							{this.state.submitting && <Icons.LoadingOutlined spin />}
							Create
						</antd.Button>
					)}
				</ActionsBar>
			</div>
		)
	}
}