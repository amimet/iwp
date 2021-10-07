import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"

import "./index.less"

export default class Roles extends React.Component {
	render() {
		const roles = []

		if (Array.isArray(this.props.roles)) {
			this.props.roles.forEach((role) => {
				roles.push(
					<div key={role}>
						<antd.Tag>{role}</antd.Tag>
					</div>
				)
			})
		}

		return <div className="roles_wrapper">{roles}</div>
	}
}
