import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"
import { LoadingSpinner } from "components"
import classnames from "classnames"

import "./index.less"

export default class Users extends React.Component {
	state = {
		data: null,
		error: null,
		selectedUsers: [],
		selectionEnabled: false,
	}

	componentDidMount = async () => {
		await this.props.api.get
			.users()
			.then((data) => {
				this.setState({ data })
			})
			.catch((err) => {
				this.setState({ error: err.message })
			})
	}

	selectUser = (user) => {
		if (!this.state.selectionEnabled) {
			return false
		}

		let list = this.state.selectedUsers ?? []

		if (!list.includes(user)) {
			list.push(user)
		} else {
			list = list.filter((_user) => user !== _user)
		}

		this.setState({ selectedUsers: list })
	}

	toogleSelectMode = (to = !this.state.selectionEnabled) => {
		if (!to && this.state.selectedUsers.length > 0) {
			this.setState({ selectedUsers: [] })
		}
		this.setState({ selectionEnabled: to })
	}

	renderRoles(roles) {
		return roles.map((role) => {
			return <antd.Tag key={role}> {role} </antd.Tag>
		})
	}

	openUser(user) {
		if (this.state.selectionEnabled) {
			return false
		}
		
		window.app.setLocation(`/account?username=${user}`)
	}

	renderSelectionBulkActions = () => {
		return (
			<div className="horizontal_actions">
				<div>
					<antd.Button>Delete</antd.Button>
				</div>
			</div>
		)
	}

	render() {
		if (this.state.errror)
			return (
				<antd.Result>
					<span>{this.state.error}</span>
				</antd.Result>
			)
		if (!this.state.data) return <LoadingSpinner />

		return (
			<div>
				<div className="users_list_wrapper">

					<div className="horizontal_actions_cascade">
						<div className="horizontal_actions">
							<div>
								<antd.Button
									onClick={() => {
										this.toogleSelectMode()
									}}
									style={{ padding: 0 }}
									shape="circle"
									icon={
										this.state.selectionEnabled ? (
											<Icons.X style={{ margin: 0 }} />
										) : (
											<Icons.Edit style={{ margin: 0 }} />
										)
									}
								/>
							</div>
							<div>
								<antd.Button icon={<Icons.Plus />}>New User</antd.Button>
							</div>
							<div>{this.state.selectedUsers}</div>
						</div>
						{this.state.selectedUsers.length > 0 && this.renderSelectionBulkActions()}
					</div>

					<div>
						<antd.List
							dataSource={this.state.data}
							renderItem={(item) => {
								return (
									<div
										key={item._id}
										onDoubleClick={() => this.openUser(item.username)}
										onClick={() => this.selectUser(item.username)}
										className={classnames("user_card", {
											selection: this.state.selectionEnabled,
											selected: this.state.selectedUsers.includes(item.username),
										})}
									>
										<div>
											<antd.Avatar shape="square" src={item.avatar} />
										</div>
										<div className="user_card_title">
											<div style={{ width: "100%", height: "33px" }}>
												<div style={{ float: "left" }}>
													<h1>{item.fullName ? item.fullName : null}</h1>
												</div>
												<div style={{ float: "right" }}>{this.renderRoles(item.roles)}</div>
											</div>
											<div>
												<h3>
													@{item.username}#{item._id}
												</h3>
											</div>
										</div>
									</div>
								)
							}}
						/>
					</div>
				</div>
			</div>
		)
	}
}
