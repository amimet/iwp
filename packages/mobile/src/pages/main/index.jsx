import React from "react"
import * as antd from "antd"
import { Clock, AssignedWorkloads } from "components"

import "./index.less"

export default class Main extends React.Component {
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

						</div>
					</div>
				</div>
				<AssignedWorkloads />
			</div>
		)
	}
}