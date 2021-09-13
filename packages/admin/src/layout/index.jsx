import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"

import config from "config"
import { Sidebar, Header, Drawer } from "./components"

import Login from "pages/login"

import "./index.less"

export const uiViewLoad = {
	login: (callback) => {
		window.controllers.drawer.open("login", Login, {
			locked: true,
			onDone: (self) => {
				if (typeof callback === "function") {
					callback()
				}
				self.close()
			},
			props: {
				closable: false,
				width: "45%",
			},
		})
	},
}

export default class BaseLayout extends React.Component {
	layoutContentRef = React.createRef()

	state = {
		collapsedSidebar: false,
	}

	handleTransition = (state, delay) => {
		const { current } = this.layoutContentRef

		if (state === "leave") {
			current.className = `fade-transverse-active fade-transverse-leave-to`
		} else {
			current.className = `fade-transverse-active fade-transverse-enter-to`
		}
	}

	componentDidMount() {
		window.app.eventBus.on("not_session", () => {
			uiViewLoad.login()
		})

		window.app.eventBus.on("not_valid_session", (error) => {
			antd.notification.open({
				message: "Invalid Session",
				description: error,
				icon: <Icons.FieldTimeOutlined />,
			})
		})

		window.app.eventBus.on("setLocation", (to, delay) => {
			this.handleTransition("leave")
		})
		window.app.eventBus.on("setLocationReady", (to, delay) => {
			this.handleTransition("enter")
		})

		window.app.eventBus.on("cleanAll", () => {
			window.controllers["drawer"].closeAll()
		})
	}

	render() {
		const Children = (props) => React.cloneElement(this.props.children, props)
		return (
			<React.Fragment>
				<antd.Layout style={{ minHeight: "100vh" }}>
					<Drawer {...this.props} />

					<Sidebar
						{...this.props}
						onCollapse={() => this.toggleCollapseSider()}
						collapsed={this.state.collapsedSidebar}
					/>

					<antd.Layout className="app_layout">
						<Header {...this.props} siteName={config.app.title} />

						<antd.Layout.Content {...this.props} className="app_wrapper">
							<div ref={this.layoutContentRef}>
								<Children {...this.props} />
							</div>
						</antd.Layout.Content>
					</antd.Layout>
				</antd.Layout>
			</React.Fragment>
		)
	}
}
