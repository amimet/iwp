import React from "react"
import * as antd from "antd"
import GoogleMap from "components/googleMap"
import * as Icons from "react-icons/md"

import "./index.less"

const api = window.app.apiBridge

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
		antd.Modal.confirm({
			title: <div style={{ display: "flex",  }}>
				<h2><Icons.MdLocationSearching style={{ marginRight: "8px",  }} /> New Location</h2>
			</div>,
			icon: false,
			content: <div className="creator_modal">
				<div>
					<h4><Icons.MdOutlineTag /> Name</h4>
					<div>
						<antd.Input placeholder="room_100" />
					</div>
				</div>
				<div>
					<h4><Icons.MdTitle /> Title</h4>
					<div>
						<antd.Input placeholder="Room 100" />
					</div>
				</div>
			</div>
		})
	}

	renderRegions(items) {
		return items.map((item) => {
			return (
				<div key={item._id} className="region_card">
					<div style={{ float: "left" }}>
						<antd.Tag>#{item.name}</antd.Tag>
						<h1>{item.title ?? item.name}</h1>
					</div>
					<div style={{ float: "right" }}>
						{GoogleMap({
							zoom: 15,
							lat: item.cords.lat,
							lng: item.cords.lng,
							markerText: item.title ?? item.name,
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
