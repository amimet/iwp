import React from "react"
import * as antd from "antd"
import { AppSearcher } from "components"
import classnames from "classnames"

import "./index.less"

export default class Header extends React.Component {
	render() {
		return (
			<antd.Layout.Header className={classnames(`app_header`, { ["hidden"]: !this.props.visible })}>
				<div>
					<AppSearcher />
				</div>
			</antd.Layout.Header>
		)
	}
}
