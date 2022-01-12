import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { AppSearcher, ServerStatus, Clock, AssignedWorkloads, } from "components"

import "./index.less"

// TODO: Customizable main menu
export default class Main extends React.Component {
	componentDidMount() {
		if (window.app?.HeaderController?.isVisible()) {
			window.app.HeaderController.toogleVisible(false)
		}
	}

	componentWillUnmount() {
		if (!window.app?.HeaderController?.isVisible()) {
			window.app.HeaderController.toogleVisible(true)
		}
	}

	render() {
		const user = this.props.user ?? {}

		return (
			<div className="dashboard">
				<div className="top">
					<div className="header_title">
						<div>
							<antd.Avatar shape="square" src={user.avatar} size={window.isMobile ? undefined : 120} />
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
				<AssignedWorkloads />
			</div>
		)
	}
}