import React from "react"
import * as antd from 'antd'
import { Icons } from 'components/icons'
import * as user from "core/models/user"
import * as session from "core/models/session"

import "./index.less"

export default class Account extends React.Component {
	state = {
		user: null,
		sessions: null,
	}

	componentDidMount = async () => {
		const query = new URLSearchParams(window.location.search)
		const requestedUser = query.get("username")
		
		const sessions = await session.getAll(this.props.api)
		const ss = JSON.parse(JSON.stringify(sessions))

		this.setState({ sessions: ss })

		if (requestedUser != null) {
			const userBasics = await user.fetchBasics(this.props.api, { username: requestedUser })
			.catch((err) => {
				console.log(err)
			})
			console.log(userBasics)
		}
	}

	renderSessions() {
		const data = this.state.sessions
		
		if (Array.isArray(data)) {
			return data.map((session) => {
				return <div key={session._id} className="session_entry">
					<Icons.Key />
					{session._id}
				</div>
			}) 
		}

		return <div>

		</div>
	}

	render() {
		if (!this.props.user) {
			return <div></div>
		}

		return (
			<div>
				<div className="app_account_header">
					<img src={this.props.user.avatar} />
					<div style={{ margin: "0 15px" }}>
						<h1>@{this.props.user.username}</h1>
						<span>#{this.props.user._id}</span>
					</div>
				</div>
				<div className="session_wrapper">
					{this.renderSessions()}
				</div>
			</div>
		)
	}
}
