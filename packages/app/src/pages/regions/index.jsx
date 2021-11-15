import React from "react"
import * as antd from "antd"
import GoogleMap from "components/googleMap"
import * as Icons from "react-icons/md"
import { FormGenerator } from "components"

import "./index.less"

const api = window.app.apiBridge

class NewRegionForm extends React.Component {
	handleFinishNewRegion = async (values, ctx) => {
		const { name, address } = values

		ctx.toogleValidation(true)
		ctx.clearErrors()

		api.put.region({ name, address })
			.then((err, data) => {
				console.log(err, data)

				if (response.status !== 200) {
					ctx.shake("all")
					ctx.error("result", response.data.error)

					return false
				}

				this.props.handleDone()
				this.props.close()
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
	}

	componentDidMount = async () => {
		const data = await api.get.regions()
		console.log(data)

		this.setState({ data })
	}

	createNewRegion = async () => {
		window.app.DrawerController.open("new_region_form", NewRegionForm)
	}

	renderRegions(items) {
		return items.map((item) => {
			return (
				<div key={item._id} className="region_card">
					<div style={{ float: "left" }}>
						<h1>{item.name}</h1>
					</div>
					<div style={{ float: "right" }}>
						{GoogleMap({
							zoom: 15,
							lat: 0,
							lng: 0,
							markerText: item.name,
						})}
					</div>
				</div>
			)
		})
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
			{this.renderRegions(this.state.data)}
			<div className="create_new" onClick={this.createNewRegion}>

			</div>
		</div>
	}
}
