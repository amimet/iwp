import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"

import config from "config"
import { Sidebar, Header, Drawer, Sidedrawer } from "./components"

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
		window.app.eventBus.on("invalid_session", (error) => {
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
			<antd.Layout style={{ height: "100%" }}>
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

				<Sidedrawer {...this.props} />
			</antd.Layout>
		)
	}
}
