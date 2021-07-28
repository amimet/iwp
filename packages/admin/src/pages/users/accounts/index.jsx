import React from "react"
import * as antd from "antd"
import { objectToArrayMap } from "@corenode/utils"
import { LoadingSpinner } from "components"
export default class Users extends React.Component {
	state = {
		data: null,
		error: null,
		users: {},
		selectedUsers: [],
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

	handleDataResponse(res) {
		let updated = {}

		objectToArrayMap(res).forEach((user) => {
			updated[user.value.username] = user.value
		})
		this.setState({ users: updated, list: res })
	}

	selectUser(user) {}

	renderRoles(roles) {
		return roles.map((role) => {
			return <antd.Tag key={role}> {role} </antd.Tag>
		})
	}

	openUser(user) {
        window.app.setLocation(`/account?username=${user}`)
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
				<div className="app_users_list_wrapper">
					<antd.List
						dataSource={this.state.data}
						renderItem={(item) => {
							return (
								<div
									key={item._id}
									onDoubleClick={() => this.openUser(item.username)}
									onClick={() => this.selectUser(item.username)}
									className="app_user_card"
								>
									<div>
										<antd.Avatar shape="square" src={item.avatar} />
									</div>
									<div className="app_user_card_title">
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
		)
	}
}
