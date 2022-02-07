import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"
import { ActionsBar, SelectableList } from "components"

import "./index.less"

export default class Users extends React.Component {
	state = {
		data: null,
		selectionEnabled: false,
	}

	api = window.app.request

	componentDidMount = async () => {
		await this.loadData()
	}

	loadData = async () => {
		this.setState({ data: null })

		const data = await this.api.get.users().catch((err) => {
			console.error(err)
			return false
		})

		if (data) {
			this.setState({ data })
		}
	}

	openUser = (key) => {
		const username = this.state.data.find((user) => {
			return user._id === key
		})?.username

		if (username) {
			window.app.setLocation(`/account`, { username })
		}
	}

	renderRoles(roles) {
		return roles.map((role) => {
			return <antd.Tag key={role}> {role} </antd.Tag>
		})
	}

	renderItem = (item) => {
		return (
			<div
				key={item._id}
				className="user_item"
			>
				<div>
					<antd.Avatar shape="square" src={item.avatar} />
				</div>
				<div className="title">
					<div className="line">
						<div>
							<h1>{item.fullName ?? item.username}</h1>
						</div>
					</div>
				</div>
				<div>{this.renderRoles(item.roles)}</div>
			</div>
		)
	}

	render() {
		return (
			<div>
				<div className="users_list">
					<ActionsBar mode="float">
						<div>
							<antd.Button type="primary" icon={<Icons.Plus />}>New User</antd.Button>
						</div>
					</ActionsBar>
					{!this.state.data ? <antd.Skeleton active /> :
						<SelectableList
							items={this.state.data}
							onDoubleClick={(key) => this.openUser(key)}
							renderItem={this.renderItem}
						/>}
				</div>
			</div>
		)
	}
}
