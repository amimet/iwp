import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"

import config from "config"
import { Sidebar, Header, Drawer } from "./components"

import * as uiHelpers from "core/uiHelpers"

import "theme/index.less"
import "./index.less"

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
		window.app.busEvent.on("not_session", () => {
			uiHelpers.openLoginDrawer()
		})

        window.app.busEvent.on("not_valid_session", (error) => {
            antd.notification.open({
                message: 'Invalid Session',
                description: error,
                icon: <Icons.FieldTimeOutlined />,
              })
        })

		window.app.busEvent.on("setLocation", (to, delay) => {
			this.handleTransition("leave")
		})
		window.app.busEvent.on("setLocationReady", (to, delay) => {
			this.handleTransition("enter")
		})

		window.app.busEvent.on("cleanAll", () => {
			window.controllers["drawer"].close()
		})

	}

	render() {
		const Children = this.props.children

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
