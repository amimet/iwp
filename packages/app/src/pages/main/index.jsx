import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { AppSearcher, ServerStatus, Clock, AssignedWorkload } from "components"

import "./index.less"

// TODO: Customizable main menu
export default class Main extends React.Component {
	state = {
		assignedWorkloads: null,
	}

	api = window.app.request

	componentDidMount() {
		this.fetchAssignedWorkloads()
		if (!window.isMobile && window.app?.HeaderController?.isVisible()) {
			window.app.HeaderController.toogleVisible(false)
		}
	}

	componentWillUnmount() {
		if (!window.isMobile && !window.app?.HeaderController?.isVisible()) {
			window.app.HeaderController.toogleVisible(true)
		}
	}

	fetchAssignedWorkloads = async () => {
		const result = await this.api.get.assignedWorkloads().catch((err) => {
			console.error(err)
			antd.message.error("Failed to fetch assigned workloads")
			return false
		})

		if (result) {
			this.setState({
				assignedWorkloads: result,
			})
		}
	}

	onClickAssignedWorkload = (_id) => {
		window.app.openWorkloadDetails(_id)
	}

	renderAssignedWorkloads = () => {
		if (!this.state.assignedWorkloads) {
			return null
		}
		if (this.state.assignedWorkloads.length === 0) {
			return <>No assigned workloads</>
		}

		return this.state.assignedWorkloads.map((workload) => {
			return <AssignedWorkload workload={workload} onClick={this.onClickAssignedWorkload} />
		})
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
							<antd.Button type="primary" onClick={() => window.app.openFabric()}>
								Create
							</antd.Button>
						</div>
					</div>
				</div>}
				<div className="assigned">
					<h2><Icons.MdPendingActions /> Assigned for you</h2>
					<div>
						{this.state.assignedWorkloads ? this.renderAssignedWorkloads() : <antd.Skeleton active />}
					</div>
				</div>
			</div>
		)
	}
}
