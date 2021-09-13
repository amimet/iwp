import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"

import { Roles } from "components"
import { AccountEditor, SessionsView, StatisticsView } from "./components"

import * as user from "core/models/user"

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
			const componentProps = {
				user: this.props.user,
			}

			return (
				<antd.Tabs.TabPane tab={renderTagDecorator(key)} key={index}>
					<div key={key}>
						<Component {...componentProps} />
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
	state = {
		isSelf: true,
		user: {},
	}

	componentDidMount = async () => {
		const query = new URLSearchParams(window.location.search)
		const requestedUser = query.get("username")

		if (requestedUser != null) {
			if (this.props.user.username === requestedUser) {
				return false
			}

			this.setState({ isSelf: false })

			await user
				.fetchData(this.props.api, { username: requestedUser })
				.then((data) => {
					this.setState({ user: data })
				})
				.catch((err) => {
					console.log(err)
				})
		}
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
				onSave: this.handleUpdateUserData
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
		const user = this.state.isSelf ? this.props.user : this.state.user

		return (
			<div className="account_wrapper">
				<div className="account_card">
					<img src={user.avatar} />
					<div style={{ margin: "0 15px" }}>
						<h1>@{user.username}</h1>
						<span>#{user._id}</span>
					</div>
					<Roles roles={user.roles} />
					{this.state.isSelf && this.renderSelfActions()}
				</div>

				{this.state.isSelf && (
					<SelfView
						components={SelfViewComponents}
						decorators={SelfViewTabDecorators}
						user={this.props.user}
					/>
				)}
			</div>
		)
	}
}
