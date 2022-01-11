import React from "react"
import * as antd from "antd"
import { Sessions } from "components"
import { Session } from "models"

export default class SessionsView extends React.Component {
	state = {
		currentSessionUUID: null,
	}

	componentDidMount = async () => {
		const currentSession = await Session.decodedToken()

		this.setState({ currentSessionUUID: currentSession?.uuid })
	}

	signOutAll = () => {
		antd.Modal.warning({
			title: "Caution",
			content: "This action will cause all sessions to be closed, you will have to log in again.",
			onOk: () => {
				if (typeof this.props.handleSignOutAll === "function") {
					this.props.handleSignOutAll()
				} else {
					antd.message.error("Sign out all sessions failed")
					console.error("handleSignOutAll is not a function")
				}
			},
			okCancel: true,
		})
	}

	render() {
		const { sessions } = this.props

		if (!sessions) {
			return <antd.Skeleton active />
		}

		return (
			<div className="session_wrapper">
				<Sessions current={this.state.currentSessionUUID} sessions={this.props.sessions} />
				{sessions && (
					<antd.Button onClick={this.signOutAll} type="danger">
						Destroy all sessions
					</antd.Button>
				)}
			</div>
		)
	}
}