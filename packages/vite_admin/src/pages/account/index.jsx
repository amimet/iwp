import React from "react"
import * as antd from 'antd'
import { Icons } from 'components/icons'
import * as user from "core/models/user"
import * as session from "core/models/session"

import "./index.less"

export default class Account extends React.Component {
	state = {
		user: {},
		sessions: null,
	}

	componentDidMount = async () => {
		// TODO: CHECK with API & session token
		let isSelf = true

		const query = new URLSearchParams(window.location.search)
		const requestedUser = query.get("username")
	
		if (requestedUser != null) {
			isSelf = false

		 	await user.fetchBasics(this.props.api, { username: requestedUser })
			.then((data) => {
				this.setState({ user: data })
			})
			.catch((err) => {
				console.log(err)
			})
		}else {
			this.setState({
				user: this.props.user
			})
		}

		if (isSelf) {
			const sessions = await session.getAll(this.props.api)
			this.setState({ sessions })
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
		const { user } = this.state ?? {}

		return (
			<div>
				<div className="app_account_header">
					<img src={user.avatar} />
					<div style={{ margin: "0 15px" }}>
						<h1>@{user.username}</h1>
						<span>#{user._id}</span>
					</div>
				</div>
				<div className="session_wrapper">
					{this.renderSessions()}
				</div>
			</div>
		)
	}
}
