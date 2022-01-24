import React from "react"
import * as antd from "antd"

import { Icons, } from "components/Icons"
import { Fabric, OperatorsAssignments, StepsForm } from "components"

import { PayloadsRender } from ".."

import "./index.less"

const steps = [
	{
		key: "name",
		title: "Name",
		icon: "Edit",
		stateValidation: (value) => {
			return value && value.length > 0
		},
		content: (props) => {
			return <div className="workload_creator steps step content">
				<antd.Input defaultValue={props.value} placeholder="Input an name" onChange={(e) => {
					props.handleUpdate(e.target.value)
				}} />
			</div>
		},
	},
	{
		key: "region",
		title: "Region",
		icon: "Globe",
		stateValidation: (value) => {
			return Boolean(value)
		},
		content: (props) => {
			const [regions, setRegions] = React.useState([])

			React.useEffect(async () => {
				const api = window.app.request
				const regions = await api.get.regions().catch((err) => {
					console.log(err)
					return false
				})

				if (regions) {
					setRegions(regions)
				}
			}, [])

			if (regions.length === 0) {
				return <antd.Skeleton />
			}

			return <div className="workload_creator steps step content">
				<antd.Select
					showSearch
					placeholder="Select a region"
					optionFilterProp="children"
					onChange={(value) => {
						props.handleUpdate(value)
					}}
					filterOption={(input, option) =>
						option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
					}
					loading={regions > 0}
				>
					{regions.map((region) => {
						return <antd.Select.Option key={region.name} value={region.name}>
							{region.name}
						</antd.Select.Option>
					})}
				</antd.Select>
			</div>
		},
	},
	{
		key: "schedule",
		title: "Schedule",
		icon: "Calendar",
		content: (props) => {
			return <div className="workload_creator steps step content">
				<antd.DatePicker.RangePicker
					showTime={{ format: "HH:mm" }}
					format="DD-MM-YYYY HH:mm"
					onChange={(value) => {
						console.log(value)
						props.handleUpdate(value)
					}}
				/>
			</div>
		}
	},
	{
		key: "operators",
		title: "Operators",
		icon: "User",
		onUpdateValue: (prev, next) => {
			return [...prev, ...next]
		},
		content: (props) => {
			return <div className="workload_creator steps step content">
				<OperatorsAssignments
					onAssignOperators={(operators) => {
						props.handleUpdate(operators)
					}}
					assigned={props.value}
				/>
			</div>
		}
	},
	{
		key: "payloads",
		title: "Payloads",
		icon: "Box",
		stateValidation: (value) => {
			return value && value.length > 0
		},
		content: (props) => {
			let [value, setValue] = React.useState(props.value ?? [])

			const openSelector = () => {
				window.app.DrawerController.open("selector", Fabric.Selector, {
					onDone: (ctx, data) => {
						onAddItem(data)
						ctx.close()
					},
					props: {
						width: "65%",
					},
				})
			}

			const onAddItem = (item) => {
				const result = [...value, item]

				setValue(result)
				props.handleUpdate(result)
			}

			const onDeleteItem = (key) => {
				const result = value.filter((item) => item._id !== key)

				setValue(result)
				props.handleUpdate(result)
			}

			return <div className="workload_creator steps step content">
				<PayloadsRender payloads={value} onDeleteItem={onDeleteItem} />

				<div key="actions" className="workload_creator steps step actions">
					<div key="add">
						<antd.Button onClick={openSelector} shape="round" icon={<Icons.Plus />}>
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
		values: null
	}

	api = window.app.request

	componentDidMount = async () => {
		if (typeof this.props.events !== "undefined") {
			this.props.events.on("create_error", (error) => {
				this.handleError(error)
			})
		}
	}

	submit = async (data, callback) => {
		const workload = {
			region: data.region,
			workshift: data.workshift,
			assigned: data.operators,
			name: data.name,
			payloads: data.payloads,
		}

		if (data.schedule != null) {
			workload.scheduledStart = data.schedule[0]
			workload.scheduledFinish = data.schedule[1]
		}

		const result = await this.api.put.workload(workload)

		if (result) {
			if (typeof this.props.handleDone === "function") {
				this.props.handleDone(result)
			}
			if (typeof this.props.close === "function") {
				this.props.close()
			}
		}
	}

	render() {
		return (
			<StepsForm
				steps={steps}
				onSubmit={this.submit}
			/>
		)
	}
}