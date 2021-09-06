import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"

import { Sessions, Roles } from "components"
import { AccountEditor } from "./components"

import * as session from "core/models/session"
import * as user from "core/models/user"

import "./index.less"

const api = window.app.apiBridge

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
			title: "Caution",
			content: "This action will cause all sessions to be closed, you will have to log in again.",
			onOk: () => {
				session.destroyAll(this.props.api)
			},
			okCancel: true,
		})
	}

	handleUpdateUserData = async (changes, callback) => {
		const update = {}
		if (Array.isArray(changes)) {
			changes.forEach((change) => {
				update[change.id] = change.value
			})
		}

		api.put
			.selfUser(update)
			.then((data) => {
				callback(false, data)
			})
			.catch((err) => {
				callback(true, err)
			})
	}

	openUserEdit = () => {
		window.controllers.drawer.open("editAccount", AccountEditor, {
			props: {
				keyboard: false,
				width: "45%",
				bodyStyle: {
					overflow: "hidden",
				},
			},
			componentProps: {
				onSave: this.handleUpdateUserData,
				user: this.state.user,
			},
		})
	}

	renderSelfActions = () => {
		if (this.state.isSelf) {
			return (
				<div onClick={this.openUserEdit}>
					<antd.Button>Edit</antd.Button>
				</div>
			)
		}

		return null
	}

	render() {
		const { user } = this.state ?? {}
		const currentSession = this.props.user?.session?.uuid

		return (
			<div className="account_wrapper">
				<div className="app_account_header">
					<img src={user.avatar} />
					<div style={{ margin: "0 15px" }}>
						<h1>@{user.username}</h1>
						<span>#{user._id}</span>
					</div>
					<Roles roles={user.roles} />
					{this.state.isSelf && this.renderSelfActions()}
				</div>

				{this.state.isSelf && (
					<div className="session_wrapper">
						<Sessions current={currentSession} sessions={this.state.sessions} />
						{this.state.sessions && (
							<antd.Button onClick={() => this.signOutAll()} type="danger">
								Destroy all sessions
							</antd.Button>
						)}
					</div>
				)}
			</div>
		)
	}
}
