import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { AppSearcher, ServerStatus } from "components"
//import * as charts from "react-chartjs-2"

import "./index.less"

// const data = {
// 	labels: ["Red", "Orange", "Blue"],
// 	datasets: [
// 		{
// 			label: "Popularity of colours",
// 			data: [55, 23, 96],
// 			borderWidth: 5,
// 			fill: false,
// 		},
// 	],
// }

// const chartKeys = Object.fromEntries(Object.keys(charts).map((key) => {
// 	return [String(key).toLowerCase(), key]
// }))

// class ChartGenerator extends React.Component {
// 	constructor(payload) {
// 		super(payload)
// 		this.payload = payload

// 		this.type = this.payload.type
// 		this.Chart = charts[this.type] ?? charts[chartKeys[this.type]]

// 		this.state = {
// 			labels: [],
// 			datasets: [],
// 		}

// 		if (!this.Chart) {
// 			console.error("Chart type is not valid")
// 		}
// 	}

// 	render() {
// 		const { Chart } = this

// 		if (React.isValidElement(Chart)) {
// 			return null
// 		}

// 		return <Chart data={this.state} />
// 	}
// }

export const Clock = () => {
	const [time, setTime] = React.useState(new Date())

	React.useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date())
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	return <div className="clock">{time.toLocaleTimeString()}</div>
}

export default class Main extends React.Component {
	componentWillUnmount() {
		if (!window.app?.HeaderController?.isVisible()) {
			window.app.HeaderController.toogleVisible(true)
		}
	}

	componentDidMount() {
		if (window.app?.HeaderController?.isVisible()) {
			window.app.HeaderController.toogleVisible(false)
		}
	}

	render() {
		const user = this.props.user ?? {}

		return (
			<div className="dashboard">
				<div className="top">
					<div className="header_title">
						<div>
							<antd.Avatar shape="square" src={user.avatar} size={120} />
						</div>
						<div>
							<div>
								<Clock />
							</div>
							<div>
								<h1>Welcome back, {user.fullName ?? user.username ?? "Guest"}</h1>
							</div>
							<div>
								<ServerStatus />
							</div>
						</div>
					</div>
					<div>
						<AppSearcher />
					</div>
				</div>
				<div className="content">
					<h2><Icons.Sliders /> Quick actions</h2>
					<div className="quick_actions">
						<div>
							<antd.Button type="primary" onClick={() => window.app.openFabric()}>
								Create
							</antd.Button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
