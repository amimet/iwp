import React from "react"
import classnames from "classnames"
import * as antd from 'antd'
import { enquireScreen, unenquireScreen } from 'enquire-js'

import Sidebar from './sidebar'
import Header from './header'
import Drawer from './drawer'
import Sidedrawer from './sidedrawer'

export const LayoutComponents = {
	Drawer,
	Sidebar,
	Header,
	Sidedrawer,
}

export default class Layout extends React.Component {
	state = {
		isMobile: false,
		isOnTransition: false,
	}

	componentDidMount() {
		this.enquireHandler = enquireScreen(mobile => {
			const { isMobile } = this.state

			if (isMobile !== mobile) {
				window.isMobile = mobile
				this.setState({
					isMobile: mobile,
				})
			}

			if (mobile) {
				window.app.eventBus.emit("mobile_mode")
			}else {
				window.app.eventBus.emit("desktop_mode")
			}
		})

		window.app.eventBus.on("setLocation", () => {
			this.setState({ isOnTransition: true })
		})
		window.app.eventBus.on("setLocationDone", () => {
			this.setState({ isOnTransition: false })
		})
	}

	componentWillUnmount() {
		unenquireScreen(this.enquireHandler)
	}

	render() {
		return <antd.Layout className={classnames("app_layout", { ["mobile"]: this.state.isMobile })} style={{ height: "100%" }}>
			<Drawer />
			{!this.state.isMobile &&< Sidebar user={this.props.user} />}
			<antd.Layout className="content_layout">
				
				<Header />
				<antd.Layout.Content className="layout_page">
					<div className={classnames("fade-transverse-active", { "fade-transverse-leave": this.state.isOnTransition })}>
						{this.props.children}
					</div>
				</antd.Layout.Content>
			</antd.Layout>
			<Sidedrawer />
		</antd.Layout>
	}
}