import React from "react"
import * as antd from "antd"

import { Sessions, Roles } from "components"

import * as session from "core/models/session"
import * as user from "core/models/user"

import "./index.less"

export default class Account extends React.Component {
	state = {
		isSelf: true,
		user: {},
		sessions: null,
	}

	componentDidMount = async () => {
		// TODO: CHECK with API & session token

		const query = new URLSearchParams(window.location.search)
		const requestedUser = query.get("username")

		if (requestedUser != null) {
			this.setState({ isSelf: false })

			await user
				.fetchData(this.props.api, { username: requestedUser })
				.then((data) => {
					this.setState({ user: data })
				})
				.catch((err) => {
					console.log(err)
				})
		} else {
			this.setState({
				user: this.props.user,
			})
		}

		if (this.state.isSelf) {
			const sessions = await session.getAll(this.props.api)
			this.setState({ sessions })
		}
	}
	signOutAll = () => {
		antd.Modal.warning({
			title: 'Caution',
			content: 'This action will cause all sessions to be closed, you will have to log in again.',
			onOk: () => {
				session.destroyAll(this.props.api)
			},
			okCancel: true,
		})
	}

	render() {
		const { user } = this.state ?? {}
		console.log(user)

		return (
			<div className="account_wrapper">
				<div className="app_account_header">
					<img src={user.avatar} />
					<div style={{ margin: "0 15px" }}>
						<h1>@{user.username}</h1>
						<span>#{user._id}</span>
					</div>
					<Roles roles={user.roles}/>
				</div>

				{this.state.isSelf && <div className="session_wrapper">
					<Sessions sessions={this.state.sessions} />
					<antd.Button onClick={() => this.signOutAll()} type="danger">
						Destroy all sessions
					</antd.Button>
				</div>}
				
			</div>
		)
	}
}
