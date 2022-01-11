import React from "react"
import classnames from "classnames"
import * as antd from 'antd'

import Sidebar from './sidebar'
import Header from './header'
import Drawer from './drawer'
import Sidedrawer from './sidedrawer'

const LayoutRenders = {
	default: (props) => {
		return <antd.Layout className="app_layout" style={{ height: "100%" }}>
			<Drawer />
			<Sidebar user={props.user} />
			<antd.Layout className="content_layout">
				<Header />
				<antd.Layout.Content className="layout_page">
					<div className={classnames("fade-transverse-active", { "fade-transverse-leave": props.isOnTransition })}>
						{props.children}
					</div>
				</antd.Layout.Content>
			</antd.Layout>
			<Sidedrawer />
		</antd.Layout>
	}
}

export default class Layout extends React.Component {
	state = {
		layoutType: "default",
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