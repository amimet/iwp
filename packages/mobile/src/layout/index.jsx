import React from "react"
import classnames from "classnames"
import * as antd from "antd"

import Drawer from "./drawer"
import BottomBar from "./bottomBar"

const LayoutRenders = {
	default: (props) => {
		return <antd.Layout className={classnames("app_layout", ["mobile"])} style={{ height: "100%" }}>
			<antd.Layout className="content_layout">
				<antd.Layout.Content className="layout_page">
					<div className={classnames("fade-transverse-active", { "fade-transverse-leave": props.isOnTransition })}>
						{props.children}
					</div>
				</antd.Layout.Content>
			</antd.Layout>
			<BottomBar user={props.user} />
			<Drawer />
		</antd.Layout>
	}
}

export default class Layout extends React.Component {
	state = {
		layoutType: "default",
		isMobile: false,
		isOnTransition: false,
	}

	setLayout = (layout) => {
		if (typeof LayoutRenders[layout] === "function") {
			return this.setState({
				layoutType: layout,
			})
		}

		return console.error("Layout type not found")
	}

	componentDidMount() {
		this.setLayout("default")

		window.app.eventBus.on("transitionStart", () => {
			this.setState({ isOnTransition: true })
		})
		window.app.eventBus.on("transitionDone", () => {
			this.setState({ isOnTransition: false })
		})
	}

	render() {
		const layoutComponentProps = {
			...this.props,
			...this.state,
		}

		if (LayoutRenders[this.state.layoutType]) {
			return LayoutRenders[this.state.layoutType](layoutComponentProps)
		}

		return LayoutRenders.default(layoutComponentProps)
	}
}