import React from "react"
import * as antd from "antd"

import { Icons } from "components/Icons"
import { Fabric } from "components"

import { OrderItems } from ".."

import "./index.less"

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

	api = window.app.request

	componentDidMount = async () => {
		if (typeof this.props.events !== "undefined") {
			this.props.events.on("create_error", (error) => {
				this.handleError(error)
			})
		}

		await this.fetchRegions()
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

	appendOrderItem = (item) => {
		const { items } = this.state

		items.push(item)

		this.setState({ items })
	}

	removeItem = (id) => {
		this.setState({ items: this.state.items.filter((item) => item._id !== id) })
	}

	canSubmit = () => {
		const isRegionSet = this.state.selectedRegion !== null
		const isNameSet = this.state.name !== null
		const hasOrderItems = this.state.items.length > 0

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

	render() {
		if (this.state.loading) return <antd.Skeleton active />

		return (
			<div className="workload_creator">
				<div><h2><Icons.GitCommit /> New Workload</h2></div>

				<div key="name">
					<h4><Icons.Tag /> Name</h4>

					<div className="body">
						<antd.Input placeholder="Order name" onChange={this.onChangeName} />
					</div>
				</div>

				<div key="region">
					<h4><Icons.Globe /> Region</h4>

					<div className="body">
						{this.renderRegionsSelector()}
					</div>
				</div>

				<div key="workshift">
					<h4><Icons.Clock /> Select a workshift</h4>

					<div className="body">
						{Object.keys(this.state.workshifts).length > 0 ? (
							<div className="workload_creator workshift">
								<antd.Select onChange={this.onSelectWorkshift} placeholder="Select an workshift">
									{this.renderWorkshiftsOptions()}
								</antd.Select>
								{this.state.selectedWorkshift && this.renderWorkshiftInfo(this.state.selectedWorkshift)}
							</div>
						) : (
							<div style={{ textAlign: "center" }}>No workshifts available for this region</div>
						)}
					</div>
				</div>

				<div key="schedule">
					<h4><Icons.Calendar /> Schedule</h4>

					<div className="body">
						<antd.DatePicker.RangePicker
							showTime={{ format: "HH:mm" }}
							format="DD-MM-YYYY HH:mm"
							onChange={this.onSetSchedule}
						/>
					</div>
				</div>

				<div key="orderItems">
					<h4><Icons.List /> Items [{this.state.items.length}]</h4>

					<div className="workload_creator orderItems">
						<OrderItems items={this.state.items} />
					</div>
				</div>

				<div key="actions" className="workload_creator actions">
					<div>
						<antd.Button onClick={this.onClickAddOrderItem} shape="round" icon={<Icons.PlusCircle />}>
							Add item
						</antd.Button>
					</div>
					<div>
						<antd.Button disabled={this.state.submitting || !this.canSubmit()} type="primary" onClick={this.submit}>
							{this.state.submitting && <Icons.LoadingOutlined spin />}
							Create
						</antd.Button>
					</div>
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
