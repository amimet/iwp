import React from "react"
import * as antd from 'antd'
import * as user from "core/models/user"
import * as session from "core/models/session"

export default class Account extends React.Component {
	state = {
		user: null,
		sessions: null,
	}

	componentDidMount = async () => {
		const query = new URLSearchParams(window.location.search)
		const requestedUser = query.get("username")
		
		const sessions = await session.getAll(this.props.apiBridge)
		console.log(sessions, Array.isArray(sessions))
		sessions.forEach(session =>{
			console.log(session)
		})

		this.setState({ sessions: sessions })

		if (requestedUser != null) {
			const userBasics = await user.fetchBasics(this.props.apiBridge, { username: requestedUser })
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
				return <div>
					session: {session.id}
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

				{this.renderSessions()}
			</div>
		)
	}
}
