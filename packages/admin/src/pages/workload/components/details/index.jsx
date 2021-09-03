import React from "react"
import { AppLoading } from "components"
import * as antd from "antd"

import './index.less'

const api = window.app.apiBridge

export default class WorkloadDetails extends React.Component {
	state = {
		data: null,
	}
	componentDidMount = async () => {
		if (typeof this.props.id === "string") {
			this.id = this.props.id
		}

		const data = await api.get.workload(undefined, { _id: this.id })
		console.log(data)

		this.setState({ data })
	}
	render() {
		const { data } = this.state

		if (data == null) {
			return <AppLoading />
		}

		return (
			<div>
				<div>
					<antd.Tag>{this.id}</antd.Tag>
				</div>
				<div>{JSON.stringify(data)}</div>
			</div>
		)
	}
}
