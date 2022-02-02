import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { AppSearcher, ServerStatus, Clock, AssignedWorkloads, } from "components"
import { Translation } from "react-i18next"

import "./index.less"

// TODO: Customizable main menu
export default class Main extends React.Component {
	componentDidMount() {
		if (!window.isMobile && window.app?.HeaderController?.isVisible()) {
			window.app.HeaderController.toogleVisible(false)
		}
	}

	componentWillUnmount() {
		if (!window.isMobile && !window.app?.HeaderController?.isVisible()) {
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
							<antd.Avatar
								shape="square"
								src={user.avatar}
								size={window.isMobile ? undefined : 120}
							/>
						</div>
						<div>
							<div>
								<Clock />
							</div>
							<div>
								<Translation>{
									(t) => <h1>{t("main_welcome")} {user.fullName ?? user.username ?? "Guest"}</h1>
								}</Translation>
							</div>
							{!window.isMobile && <div>
								<ServerStatus />
							</div>}
						</div>
					</div>
					{!window.isMobile && <div>
						<AppSearcher />
					</div>}
				</div>

				{!window.isMobile && <div className="content">
					<h2><Icons.Sliders /> Quick actions</h2>
					<div className="quick_actions">
						<div>
							<antd.Button type="primary" onClick={() => window.app.openCreateNew()}>
								Create
							</antd.Button>
						</div>
					</div>
				</div>}

				<div className="widgets">
					<div key="assignedWorkloads" className="widget">
						<AssignedWorkloads />
					</div>
				</div>
			</div>
		)
	}
}