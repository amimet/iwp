import React from "react"
import * as user from 'core/models/user'


export default class Account extends React.Component {
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
			</div>
		)
	}
}
