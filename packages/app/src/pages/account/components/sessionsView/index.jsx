import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { Sessions } from "components"

import * as sessionLib from "core/models/session"
import * as userLib from "core/models/user"

export default class SessionsView extends React.Component {
	state = {
		user: {},
		sessions: null,
	}

	componentDidMount() {
		window.app.eventBus.on("forceReloadUser", () => {
			this.loadSessions()
		})

		this.loadSessions()
	}

	signOutAll = () => {
		antd.Modal.warning({
			title: "Caution",
			content: "This action will cause all sessions to be closed, you will have to log in again.",
			onOk: () => {
				this.setState({ sessions: null })
				window.app.eventBus.emit("destroyAllSessions")
			},
			okCancel: true,
		})
	}

	loadSessions = async () => {
		const currentUser = userLib.getCurrentUser()
		const sessions = await sessionLib.getAll()

		this.setState({ sessions, user: currentUser })
	}

	render() {
		const { user, sessions } = this.state
		const currentSession = user.session?.uuid

		if (!currentSession) {
			return <antd.Skeleton active />
		}

		return (
			<div className="session_wrapper">
				<Sessions current={currentSession} sessions={sessions} />
				{sessions && (
					<antd.Button onClick={this.signOutAll} type="danger">
						Destroy all sessions
					</antd.Button>
				)}
			</div>
		)
	}
}