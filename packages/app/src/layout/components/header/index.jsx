import React from "react"
import * as antd from "antd"
import { AppSearcher } from "components"
import classnames from "classnames"

import "./index.less"

export default class Header extends React.Component {
	state = {
		loadingSearch: false,
		visible: true,
	}

	componentDidMount() {
		window.toogleHeader = (to) => {
			this.setState({ visible: to ?? !this.state.visible })
		}
	}

	render() {
		window.headerVisible = this.state.visible

		return (
			<antd.Layout.Header className={classnames(`app_header`, { ["hidden"]: !this.state.visible })}>
				<div>
					<AppSearcher />
				</div>
			</antd.Layout.Header>
		)
	}
}
