import React from "react"
import * as antd from "antd"
import { Translation } from "react-i18next"

import { Icons, } from "components/Icons"
import { Fabric, OperatorsAssignments, StepsForm } from "components"

import { PayloadsRender } from ".."

import "./index.less"

const steps = [
	{
		key: "name",
		title: "Name",
		icon: "Edit",
		description: "Enter the name or a reference for the workorder.",
		required: true,
		content: (props) => {
			return <div className="workorder_creator steps step content">
				<antd.Input onPressEnter={props.onPressEnter} defaultValue={props.value} placeholder="Input an name" onChange={(e) => {
					props.handleUpdate(e.target.value)
				}} />
			</div>
		},
	},
	{
		key: "section",
		title: "Section",
		icon: "Globe",
		required: true,
		description: "Select the section where the workorder will be deployed.",
		content: (props) => {
			const [sections, setSections] = React.useState([])

			React.useEffect(async () => {
				const api = window.app.request
				const sections = await api.get.sections().catch((err) => {
					console.log(err)
					return false
				})

				if (sections) {
					setSections(sections)
				}
			}, [])

			if (sections.length === 0) {
				return <antd.Skeleton active />
			}

			return <div className="workorder_creator steps step content">
				<antd.Select
					showSearch
					placeholder="Select a section"
					optionFilterProp="children"
					defaultValue={props.value}
					onChange={(value) => {
						props.handleUpdate(value)
					}}
					filterOption={(input, option) =>
						option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
					}
					loading={sections > 0}
				>
					{sections.map((section) => {
						return <antd.Select.Option key={section.name} value={section.name}>
							{section.name}
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
		description: "Select the schedule for the workorder.",
		content: (props) => {
			return <div className="workorder_creator steps step content">
				<antd.DatePicker.RangePicker
					showTime={{ format: "HH:mm" }}
					format="DD-MM-YYYY HH:mm"
					onChange={(value) => {
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
		description: "Assign the operators for the workorder.",
		content: (props) => {
			return <div className="workorder_creator steps step content">
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
		title: "Workloads",
		icon: "Box",
		required: true,
		description: "Define the workloads for the workorder.",
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
				item.key = value.length + 1

				const result = [...value, item]

				setValue(result)
				props.handleUpdate(result)
			}

			const onDeleteItem = (item) => {
				const result = value.filter((_item) => _item.key !== item.key)

				setValue(result)
				props.handleUpdate(result)
			}

			return <div className="workorder_creator steps step content">
				<PayloadsRender preview payloads={value} onDeleteItem={onDeleteItem} />

				<div key="actions" className="workorder_creator steps step actions">
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

export default class WorkorderCreator extends React.Component {
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
		const workorder = {
			section: data.section,
			workshift: data.workshift,
			assigned: data.operators,
			name: data.name,
			payloads: data.payloads,
		}

		if (data.schedule != null) {
			workorder.scheduledStart = data.schedule[0]
			workorder.scheduledFinish = data.schedule[1]
		}

		const result = await this.api.put.workorder(workorder)

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