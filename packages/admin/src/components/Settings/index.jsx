import React from "react"
import { Icons } from "components/icons"
import * as antd from "antd"

import "./index.less"

const ItemTypes = {
	Button: antd.Button,
	Switch: antd.Switch,
	Slider: antd.Slider,
	Checkbox: antd.Checkbox,
	Input: antd.Input,
	InputNumber: antd.InputNumber,
	Select: antd.Select,
}

import settingList from "schemas/settingsList.json"
import groupsDecorator from "schemas/settingsGroupsDecorator.json"
import * as session from 'core/models/session'

export class SettingsMenu extends React.Component {
	state = {
		settings: window.app.params.settings.get() ?? {},
	}

	_set(key, value) {
		this.setState({ settings: window.app.params.settings.change(key, value) })
	}

	handleEvent(event, id, type) {
		if (typeof id === "undefined") {
			console.error(`No setting id provided!`)
			return false
		}
		if (typeof type !== "string") {
			console.error(`Invalid eventType data-type, expecting string!`)
			return false
		}

		const value = window.app.params.settings.get(id) ?? false
		let to = !value

		switch (type.toLowerCase()) {
			case "button": {
				window.app.params.settings.events.emit("changeSetting", { event, id, value, to })
				break
			}
			default: {
				this._set(id, to)
				break
			}
		}
	}

	generateMenu(data) {
		let items = {}

		const renderGroupItems = (group) => {
			return items[group].map((item) => {
				if (!item.type) {
					console.error(`Item [${item.id}] has no an type!`)
					return null
				}

				if (typeof item.props === "undefined") {
					item.props = {}
				}

				switch (item.type.toLowerCase()) {
					case "switch": {
						item.props.checked = this.state.settings[item.id]
						break
					}

					default: {
						item.props.value = this.state.settings[item.id]
						break
					}
				}
				return (
					<div key={item.id}>
						<h5>
							{" "}
							{item.icon ? React.createElement(Icons[item.icon]) : null}
							{item.title ?? item.id}{" "}
						</h5>
						{item.render ??
							React.createElement(ItemTypes[item.type], {
								onClick: (e) => this.handleEvent(e, item.id ?? "anon", item.type),
								children: item.title ?? item.id,
								...item.props,
							})}
					</div>
				)
			})
		}

		const renderGroupDecorator = (group) => {
			if (group === "none") {
				return null
			}
			const fromDecoratorIcon = groupsDecorator[group]?.icon
			const fromDecoratorTitle = groupsDecorator[group]?.title

			return (
				<div>
					<h1>
						{fromDecoratorIcon ? React.createElement(Icons[fromDecoratorIcon]) : null}{" "}
						{fromDecoratorTitle ?? group}
					</h1>
				</div>
			)
		}

		if (Array.isArray(data)) {
			data.forEach((item) => {
				if (typeof item.group == "undefined") {
					item.group = "none"
				}

				if (!items[item.group]) {
					items[item.group] = []
				}

				items[item.group].push(item)
			})
		}

		return Object.keys(items).map((group) => {
			return (
				<div key={group} style={{ marginBottom: "30px" }}>
					{renderGroupDecorator(group)}
					<div key={group} className="settings_groupItems">
						{renderGroupItems(group)}
					</div>
				</div>
			)
		})
	}

	renderAboutApp() {
		const { about } = window.app
		const isDevMode = about.environment === "development"

		return (
			<div className="settings_about_app">
				<div>{about.siteName}</div>
				<div>
					<antd.Tag>
						<Icons.Tag />v{about.version}
					</antd.Tag>
				</div>
				<div>
					<antd.Tag color={isDevMode ? "magenta" : "green"}>
						{isDevMode ? <Icons.Triangle /> : <Icons.Box />}
						{about.environment}
					</antd.Tag>
				</div>
			</div>
		)
	}

	renderLogout() {
		if (this.props.session?.valid) {
			return (
				<div>
					<antd.Button onClick={() => {session.logout(this.props.api)}} type="danger">Logout</antd.Button>
				</div>
			)
		}

		return <div></div>
	}

	render() {
		return (
			<div>
				{this.generateMenu(settingList)}
				<div className="settings_bottom_items">
					{this.renderLogout()}
					{this.renderAboutApp()}
				</div>
			</div>
		)
	}
}

const controller = {
	open: (key) => {
		// TODO: Scroll to content
		window.controllers.drawer.open("settings", SettingsMenu, {
			props: {
				width: "45%",
			},
		})
	},

	close: () => {
		window.controllers.drawer.close("settings")
	},
}

export default controller
