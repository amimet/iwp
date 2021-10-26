import React from "react"
import { Icons, createIconRender } from "components/icons"
import { Layout, Menu, Avatar, Button } from "antd"

import { Settings, ActionsBar } from "components"
import { Controller } from "core/libs"
import { SidebarEditor } from "./components"

import config from "config"
import sidebarItems from "schemas/sidebar.json"
import defaultSidebarItems from "schemas/defaultSidebar.json"

import "./index.less"

const { Sider } = Layout

const onClickHandlers = {
	settings: (event) => {
		Settings.open()
	},
}

const getStoragedKeys = () => {
	return window.app.configuration?.sidebar.get()
}

export default class Sidebar extends React.Component {
	state = {
		isHover: false,
		collapsed: this.props.collapsed ?? window.app.configuration.settings.get("collapseOnLooseFocus") ?? false,
		editMode: false,
		loading: true,
		pathResolve: {},
		menus: {},
		extraItems: {
			bottom: [],
			top: [],
		},
	}
	controller = new Controller({ id: "sidebar", locked: true })

	componentDidMount = () => {
		this.controller.add(
			"toogleEdit",
			(to) => {
				this.toogleEditMode(to)
			},
			{ lock: true },
		)

		this.controller.add(
			"toogleCollapse",
			(to) => {
				this.setState({ collapsed: to ?? !this.state.collapsed })
			},
			{ lock: true },
		)

		this.controller.add("appendItem", this.appendItem)
		this.loadSidebarItems()
	}

	appendItem = (item = {}) => {
		const { position } = item

		if (typeof position === "undefined" && typeof this.state.extraItems[position] === "undefined") {
			console.error("Invalid position")
			return false
		}

		const state = this.state.extraItems

		state[position].push(item)

		this.setState({ extraItems: state })
	}

	loadSidebarItems = () => {
		const items = {}
		const itemsMap = []
	
		// parse all items from schema
		sidebarItems.forEach((item, index) => {
			items[item.id] = {
				...item,
				index,
				content: (
					<>
						{createIconRender(item.icon)} {item.title}
					</>
				),
			}
		})

		// filter undefined to avoid error
		let keys = (getStoragedKeys() ?? defaultSidebarItems).filter((key) => {
			if (typeof items[key] !== "undefined") {
				return true
			}
		})

		// short items
		keys.forEach((id, index) => {
			const item = items[id]
			
			if (item.locked) {
				if (item.index !== index) {
					keys = keys.move(index, item.index)

					//update index
					window.app.configuration.sidebar._push(keys)
				}
			}
		})

		// set items from scoped keys
		keys.forEach((key, index) => {
			const item = items[key]

			try {
				// avoid if item is duplicated
				if (itemsMap.includes(item)) {
					return false
				}

				let valid = true

				if (typeof item.requireState === "object") {
					const { key, value } = item.requireState
					//* TODO: check global state
				}

				// end validation
				if (!valid) {
					return false
				}

				if (typeof item.path !== "undefined") {
					let resolvers = this.state.pathResolve ?? {}
					resolvers[item.id] = item.path
					this.setState({ pathResolve: resolvers })
				}

				itemsMap.push(item)
			} catch (error) {
				return console.log(error)
			}
		})

		// update states
		this.setState({ items, menus: itemsMap, loading: false })
	}

	renderMenuItems(items) {
		const handleRenderIcon = (icon) => {
			if (typeof icon === "undefined") {
				return null
			}
			return createIconRender(icon)
		}

		return items.map((item) => {
			if (Array.isArray(item.children)) {
				return (
					<Menu.SubMenu
						key={item.id}
						icon={handleRenderIcon(item.icon)}
						title={<span>{item.title}</span>}
						{...item.props}
					>
						{this.renderMenuItems(item.children)}
					</Menu.SubMenu>
				)
			}

			return (
				<Menu.Item key={item.id} icon={handleRenderIcon(item.icon)} {...item.props}>
					{item.title ?? item.id}
				</Menu.Item>
			)
		})
	}

	handleClick = (e) => {
		if (typeof e.key === "undefined") {
			window.app.eventBus.emit("invalidSidebarKey", e)
			return false
		}

		if (typeof onClickHandlers[e.key] === "function") {
			return onClickHandlers[e.key](e)
		}
		if (typeof this.state.pathResolve[e.key] !== "undefined") {
			return window.app.setLocation(`/${this.state.pathResolve[e.key]}`, 150)
		}

		return window.app.setLocation(`/${e.key}`, 150)
	}

	toogleEditMode(to) {
		if (typeof to === "undefined") {
			to = !this.state.editMode
		}

		if (to) {
			window.app.eventBus.emit("cleanAll")
		} else {
			if (this.itemsMap !== getStoragedKeys()) {
				this.loadSidebarItems()
			}
		}

		this.setState({ editMode: to })
	}

	onMouseEnter = (event) => {
		this.setState({ isHover: true })
	}

	handleMouseLeave = (event) => {
		this.setState({ isHover: false })
	}

	renderExtraItems = (position) => {
		return this.state.extraItems[position].map((item = {}) => {
			if (typeof item.icon !== "undefined") {
				if (typeof item.props !== "object") {
					item.props = Object()
				}

				item.props["icon"] = createIconRender(item.icon)
			}

			return <Menu.Item key={item.id} {...item.props}>{item.children}</Menu.Item>
		})
	}

	render() {
		if (this.state.loading) return null

		const { user } = this.props

		if (window.app.configuration?.settings.is("collapseOnLooseFocus", true) && !this.state.editMode) {
			while (this.state.isHover && this.state.collapsed) {
				this.controller.toogleCollapse(false)
				break
			}
			while (!this.state.isHover && !this.state.collapsed) {
				const delay = 500
				setTimeout(() => {
					this.controller.toogleCollapse(true)
				}, delay)

				break
			}
		} else {
			if (this.state.collapsed) {
				this.controller.toogleCollapse(false)
			}
		}

		return (
			<Sider
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				theme={this.state.theme}
				width={this.state.editMode ? 400 : 200}
				collapsed={this.state.collapsed}
				onCollapse={() => this.props.onCollapse()}
				className={this.state.editMode ? "app_sidebar_sider_edit" : "app_sidebar_sider"}
			>
				<div className="app_sidebar_header">
					<div className="app_sidebar_header_logo">
						<img src={config.logo?.alt ?? null} />
					</div>
				</div>

				{this.state.editMode && (
					<div style={{ height: "100%" }}>
						<SidebarEditor />
					</div>
				)}

				{!this.state.editMode && (
					<div key="menu" className="app_sidebar_menu">
						<Menu selectable={true} mode="inline" theme={this.state.theme} onClick={this.handleClick}>
							{this.renderMenuItems(this.state.menus)}
							{this.renderExtraItems("top")}
						</Menu>
					</div>
				)}

				{!this.state.editMode && (
					<div key="bottom" className="app_sidebar_bottom">
						<Menu selectable={false} mode="inline" theme={this.state.theme} onClick={this.handleClick}>
							<Menu.Item key="settings" icon={<Icons.Settings />}>
								Settings
							</Menu.Item>

							<Menu.Item key="account">
								<div className="sidebar_account_component">
									<Avatar src={user?.avatar} />
								</div>
							</Menu.Item>

							{this.renderExtraItems("bottom")}
						</Menu>
					</div>
				)}
			</Sider>
		)
	}
}
