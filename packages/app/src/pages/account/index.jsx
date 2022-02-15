import React from "react"
import * as antd from "antd"
import { Translation } from "react-i18next"

import { Icons } from "components/Icons"
import { Skeleton, ActionsBar } from "components"
import { Session, User } from "models"

import { AccountEditor, SessionsView, StatisticsView } from "./components"

import "./index.less"

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
	static bindApp = ["userController", "sessionController"]

	state = {
		hasManager: false,
		isSelf: false,
		user: null,
		sessions: null
	}

	api = window.app.request

	componentDidMount = async () => {
		const token = await Session.decodedToken()
		const location = window.app.history.location
		const query = new URLSearchParams(location.search)

		const requestedUser = location.state?.username ?? query.get("username") ?? token?.username
		let state = this.state

		if (requestedUser != null) {
			if (token.username === requestedUser) {
				state.isSelf = true
				state.sessions = await this.props.contexts.app.sessionController.getAllSessions()
			}

			state.user = await this.props.contexts.app.userController.getData({ username: requestedUser })
		}

		state.hasManager = await User.hasRole("manager")
		state.hasAdmin = await User.hasRole("admin")

		this.setState(state)
	}

	handleSignOutAll = () => {
		return this.props.contexts.app.sessionController.destroyAllSessions()
	}

	handleUpdateUserData = async (changes) => {
		const update = {}

		if (Array.isArray(changes)) {
			changes.forEach((change) => {
				update[change.id] = change.value
			})
		}

		return await this.api.put.user({ _id: this.state.user._id, update }).catch((err) => {
			antd.message.error(err.message)
			console.error(err)
			return false
		})
	}

	openUserEdit = () => {
		window.app.DrawerController.open("editAccount", AccountEditor, {
			props: {
				keyboard: false,
			},
			componentProps: {
				onSave: this.handleUpdateUserData,
				user: this.state.user,
			},
			onDone: (ctx, value) => {
				this.setState({ user: value })
				ctx.close()
			}
		})
	}

	openRolesManager = () => {

	}

	render() {
		const user = this.state.user

		if (!user) {
			return <Skeleton />
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
				</div>

				{(this.state.isSelf || this.state.hasManager) && <ActionsBar spaced padding="8px">
					<antd.Button
						icon={<Icons.Edit />}
						shape="round"
						onClick={this.openUserEdit}
					>
						<Translation>
							{(t) => <>{t("Edit")}</>}
						</Translation>
					</antd.Button>
					{this.state.hasAdmin && <antd.Button
						icon={<Icons.Link />}
						shape="round"
						onClick={this.openRolesManager}
					>
						<Translation>
							{(t) => <>{t("Manage roles")}</>}
						</Translation>
					</antd.Button>}
				</ActionsBar>}

				{this.state.isSelf && (
					<SelfView
						components={SelfViewComponents}
						decorators={SelfViewTabDecorators}
						componentProps={{
							sessions: this.state.sessions,
							user: this.state.user,
							handleSignOutAll: this.handleSignOutAll,
						}}
					/>
				)}
			</div>
		)
	}
}