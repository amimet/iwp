import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { FormGenerator, ActionsBar, SelectableList, Skeleton } from "components"
import classnames from "classnames"

import "./index.less"

// TODO: Work on location childrens
class NewSectionForm extends React.Component {
	api = window.app.request

	handleFinishNewSection = async (values, ctx) => {
		const { name, address } = values

		ctx.toogleValidation(true)
		ctx.clearErrors()


		this.api.put.section({ name, address })
			.then((data) => {
				this.props.handleDone(data)
				this.props.close()
			})
			.catch((err) => {
				ctx.toogleValidation(false)
				ctx.shake("all")
				ctx.error("result", err)

			})
	}

	render() {
		return <div>
			<div style={{ display: "flex", }}>
				<h2><Icons.MdLocationSearching style={{ marginRight: "8px", }} /> New Location</h2>
			</div>
			<FormGenerator
				name="new_section_form"
				onFinish={this.handleFinishNewSection}
				items={[
					{
						id: "name",
						element: {
							component: "Input",
							icon: <Icons.MdOutlineTag />,
							placeholder: "New section",
							props: null
						},
						item: {
							hasFeedback: true,
							rules: [
								{
									required: true,
									message: 'Please input an name!',
								},
							],
							props: null
						}
					},
					{
						id: "address",
						element: {
							component: "Input",
							icon: <Icons.MdMyLocation />,
							placeholder: "Av. de Zaragoza, 70, Pamplona",
							props: null
						},
						item: {
							hasFeedback: true,
							props: null
						}
					},
					{
						id: "submit",
						withValidation: true,
						element: {
							component: "Button",
							props: {
								children: "Create",
								type: "primary",
								htmlType: "submit"
							}
						}
					},
				]}
			/>
		</div>
	}
}

export default class Geo extends React.Component {
	state = {
		data: null,
		selectionEnabled: false,
	}
	api = window.app.request

	componentDidMount = async () => {
		const data = await this.api.get.sections()
		console.log(data)

		this.setState({ data })
	}

	toogleSelection = (to) => {
		this.setState({ selectionEnabled: to ?? !this.state.selectionEnabled })
	}

	appendSection = (data) => {
		let update = this.state.data

		update.push(data)

		this.setState({ data: update })
	}

	createNewSection = async () => {
		window.app.DrawerController.open("new_section_form", NewSectionForm, {
			onDone: (ctx, data) => {
				this.appendSection(data)
			},
		})
	}

	renderItem = (item) => {
		console.log(item)

		return <div>
			<h1>{item.name}</h1>
		</div>
	}

	render() {
		if (!this.state.data) return <Skeleton />

		if (this.state.data.length === 0) {
			return <antd.Result
				icon={<Icons.MdWrongLocation style={{ width: 100, height: 100 }} />}
				title="No sections available"
				extra={<antd.Button type="primary" onClick={this.createNewSection} >Create new</antd.Button>}
			/>
		}

		return <div className="sections_list">
			<ActionsBar mode="float">
				<div>
					<antd.Button icon={<Icons.Plus />} type="primary" onClick={this.createNewSection}>
						New
					</antd.Button>
				</div>
				<div>
					<antd.Button type={this.state.selectionEnabled ? "default" : "primary"} onClick={() => this.toogleSelection()}>
						{this.state.selectionEnabled ? "Cancel" : "Select"}
					</antd.Button>
				</div>
			</ActionsBar>
			<div className={classnames("list", (this.state.selectionEnabled ? ["selectionEnabled"] : ["selectionDisabled"]))}>
				<SelectableList
					selectionEnabled={this.state.selectionEnabled}
					items={this.state.data}
					renderItem={this.renderItem}
					actions={[
						<div key="delete" call="onDelete">
							<Icons.Trash />
							Delete
						</div>,
					]}
					events={{
						onDelete: this.onDeleteItems,
					}}
				/>
			</div>
		</div>
	}
}