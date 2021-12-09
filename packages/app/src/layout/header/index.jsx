import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { AppSearcher } from "components"
import classnames from "classnames"

import "./index.less"

export default class Header extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			visible: true,
		}

		this.HeaderController = {
			toogleVisible: (to) => {
				if (window.isMobile) {
					to = true
				}

				this.setState({ visible: to ?? !this.state.visible })
			},
			isVisible: () => this.state.visible,
		}

		window.app["HeaderController"] = this.HeaderController
	}

	onClickCreate = () => {
		window.app.openFabric()
	}

	onClickHome = () => {
		window.app.setLocation("home")
	}

	render() {
		return (
			<antd.Layout.Header className={classnames(`app_header`, { ["hidden"]: !window.isMobile && !this.state.visible })}>
				{window.isMobile && <div>
					<antd.Button
						onClick={this.onClickHome}
						type="primary"
						shape="circle"
						icon={<Icons.Home style={{ margin: 0 }} />}
					/>
				</div>}
				<div>
					<antd.Button
						onClick={this.onClickCreate}
						type="primary"
						shape="circle"
						icon={<Icons.Plus style={{ margin: 0 }} />}
					/>
				</div>
				<div>
					<AppSearcher />
				</div>
			</antd.Layout.Header>
		)
	}
}
