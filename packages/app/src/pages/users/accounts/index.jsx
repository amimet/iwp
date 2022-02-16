import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { ActionsBar, SelectableList, UserRegister, Skeleton } from "components"
import { Translation } from "react-i18next"

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

	handleUserRegister = async () => {
		window.app.DrawerController.open("UserRegister", UserRegister)
	}

	renderRoles(roles) {
		return roles.map((role) => {
			return <antd.Tag key={role}> {role} </antd.Tag>
		})
	}

	renderItem = (item) => {
		return (
			<div className="user_item">
				<div className="title">
					<div>
						<antd.Avatar shape="square" src={item.avatar} />
					</div>
					<div>
						<h1>{item.fullName}</h1>
						<div>
							<h3>
								@{item.username} #{item._id}
							</h3>
						</div>
					</div>
				</div>
				<div>
					<Icons.Link />
					{this.renderRoles(item.roles)}
				</div>
			</div>
		)
	}

	render() {
		return (
			<div>
				<div className="users_list">
					<ActionsBar mode="float">
						<div>
							<antd.Button
								type="primary"
								icon={<Icons.Plus />}
								onClick={this.handleUserRegister}
							>
								<Translation>
									{t => t("New User")}
								</Translation>
							</antd.Button>
						</div>
					</ActionsBar>
					{!this.state.data ? <Skeleton /> :
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
