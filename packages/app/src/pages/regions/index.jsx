import React from "react"
import * as antd from "antd"
import GoogleMap from "components/googleMap"
import { LoadingSpinner } from "components"

const api = window.app.apiBridge

export default class Geo extends React.Component {
	state = {
		data: null,
	}

	componentDidMount = async () => {
		const data = await api.get.regions()
		this.setState({ data })
	}

	renderRegions(items) {
		if (!items || !Array.isArray(items)) {
			console.warn(`Invalid items recived > ${typeof items}`)
			return null
		}

		return items.filter((item) => {
			if (!item.geo || !item.data) {
				return false
			}

			return true
		}).map((item) => {
			return (
				<div key={item.id} className="app_regions_card">
					<div style={{ float: "left" }}>
						<antd.Tag>#{item.id}</antd.Tag>
						<h1>{item.data.title ?? item.data.name}</h1>
					</div>
					<div style={{ float: "right" }}>
						{GoogleMap({
							zoom: 15,
							lat: item.geo.lat,
							lng: item.geo.lng,
							markerText: item.data.name,
						})}
					</div>
				</div>
			)
		})
	}

	render() {
		if (!this.state.data) return <LoadingSpinner />

		return <div className="app_regions_wrapper">{this.renderRegions(this.state.data)}</div>
	}
}
