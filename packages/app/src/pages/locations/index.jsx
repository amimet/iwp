import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { FormGenerator, ActionsBar, SelectableList } from "components"
import classnames from "classnames"

import "./index.less"

const api = window.app.request

// TODO: Work on location childrens
class NewRegionForm extends React.Component {
	handleFinishNewRegion = async (values, ctx) => {
		const { name, address } = values

		ctx.toogleValidation(true)
		ctx.clearErrors()

		api.put.region({ name, address })
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
				name="new_region_form"
				onFinish={this.handleFinishNewRegion}
				items={[
					{
						id: "name",
						element: {
							component: "Input",
							icon: <Icons.MdOutlineTag />,
							placeholder: "New region",
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

	componentDidMount = async () => {
		const data = await api.get.regions()
		console.log(data)

		this.setState({ data })
	}

	toogleSelection = (to) => {
		this.setState({ selectionEnabled: to ?? !this.state.selectionEnabled })
	}

	appendRegion = (data) => {
		let update = this.state.data

		update.push(data)

		this.setState({ data: update })
	}

	createNewRegion = async () => {
		window.app.DrawerController.open("new_region_form", NewRegionForm, {
			onDone: (ctx, data) => {
				this.appendRegion(data)
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
		if (!this.state.data) return <antd.Skeleton active />

		if (this.state.data.length === 0) {
			return <antd.Result
				icon={<Icons.MdWrongLocation style={{ width: 100, height: 100 }} />}
				title="No regions available"
				extra={<antd.Button type="primary" onClick={this.createNewRegion} >Create new</antd.Button>}
			/>
		}

		return <div className="regions_list">
			<ActionsBar>
				<div>
					<antd.Button type="primary" onClick={this.createNewRegion}>
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
					onDelete={this.onDeleteItems}
					actions={[
						<div key="delete" call="onDelete">
							<Icons.Trash />
							Delete
						</div>,
					]}
				/>
			</div>
		</div>
	}
}