import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"

import { Roles } from "components"
import { AccountEditor, SessionsView, StatisticsView } from "./components"

import Session from "core/models/session"

import "./index.less"

const api = window.app.apiBridge

const SelfViewComponents = {
	sessionsView: SessionsView,
	statisticsView: StatisticsView,
}

const SelfViewTabDecorators = {
	sessionsView: (
		<div>
			<Icons.Key /> Sessions
		</div>
	),
	statisticsView: (
		<div>
			<Icons.PieChart /> Statistics
		</div>
	),
}

class SelfView extends React.Component {
	renderComponents = () => {
		const renderTagDecorator = (key) => {
			if (typeof this.props.decorators[key] !== "undefined") {
				return this.props.decorators[key]
			}
			return key
		}

		return Object.keys(this.props.components).map((key, index) => {
			const Component = this.props.components[key]

			return (
				<antd.Tabs.TabPane tab={renderTagDecorator(key)} key={index}>
					<div key={key}>
						<Component {...this.props.componentProps} />
					</div>
				</antd.Tabs.TabPane>
			)
		})
	}

	render() {
		return (
			<antd.Tabs defaultActiveKey="0" centered>
				{this.renderComponents()}
			</antd.Tabs>
		)
	}
}

export default class Account extends React.Component {
	static connectContext = ["userController", "sessionController"]

	state = {
		isSelf: false,
		user: null,
		sessions: null
	}

	componentDidMount = async () => {
		const token = Session.decodedToken
		const query = new URLSearchParams(window.location.search)
		const requestedUser = query.get("username") ?? token?.username

		let state = this.state

		if (requestedUser != null) {
			if (token.username === requestedUser) {
				state.isSelf = true
				state.sessions = await this.props.sessionController.getAllSessions()
			}

			state.user = await this.props.userController.getData({ username: requestedUser })
		}

		this.setState(state)
	}

	handleUpdateUserData = async (changes, callback) => {
		const update = {}
		if (Array.isArray(changes)) {
			changes.forEach((change) => {
				update[change.id] = change.value
			})
		}

		await api.put
			.selfUser(update)
			.then((data) => {
				callback(false, data)
			})
			.catch((err) => {
				callback(true, err)
			})

		window.app.eventBus.emit("forceReloadUser")
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
		const user = this.state.user

		if (!user) {
			return <antd.Skeleton active />
		}

		return (
			<div className="account_wrapper">
				<div className="account_card">
					<img src={user.avatar} />
					<div style={{ margin: "0 15px" }}>
						{Boolean(user.fullName) ?
							<>
								<h1>{user.fullName}</h1>
								<span>@{user.username}#{user._id}</span>
							</> :
							<>
								<h1>@{user.username}</h1>
								<span>#{user._id}</span>
							</>
						}
					</div>
					<Roles roles={user.roles} />
					{this.state.isSelf && this.renderSelfActions()}
				</div>

				{this.state.isSelf && (
					<SelfView
						components={SelfViewComponents}
						decorators={SelfViewTabDecorators}
						componentProps={{
							sessions: this.state.sessions,
							user: this.state.user,
							decodedToken: Session.decodedToken,
						}}
					/>
				)}
			</div>
		)
	}
}
