import React from "react"
import { Controller } from "core/libs"
import * as antd from "antd"

export class Drawer extends React.Component {
    render() {
        return <antd.Drawer
            visible={this.props.render}
        >

        </antd.Drawer>
    }
}

export default class DrawerController extends React.Component {
	windowController = new Controller({ id: "drawer", locked: true })

	state = {
        address: {},
		instances: [],
	}

	componentDidMount() {
		this.windowController.add(
			"open",
			this.open,
			{ lock: true },
		)

		this.windowController.add(
			"close",
			this.close,
			{ lock: true },
		)
	}

	lock = () => {}

	unlock = () => {}

	open = (component, options) => {
        const instances = this.state.instances ?? []

        instances.push(new Drawer())
        this.setState({ instances })


        return 
    }

	close = (component) => {}

	handleDrawerEvent(e, instance) {
		let drawerInstance = this.state.instance

		const event = { ...e }
		const { eventInstance, type } = event

		if (typeof eventInstance !== "string") {
			console.warn(`eventInstance is not defined / valid, handling with default event`)
		}

		const isOpenDrawer = () => Boolean(drawerInstance.render ? true : false)
		const isLocked = () => Boolean(drawerInstance.options?.lock ?? false)

		switch (eventInstance) {
			case "lock": {
				return this.handleUpdateDrawerInstance({ options: { lock: true } })
			}
			case "unlock": {
				return this.handleUpdateDrawerInstance({ options: { lock: false } })
			}
			case "onClose": {
				if (isLocked()) {
					console.warn(`Drawer is locked, render update is not allowed`)
					return false
				}
				drawerInstance.render = null
				return this.handleUpdateDrawerInstance(drawerInstance)
			}
			case "open": {
				let timeout = 0
				if (isOpenDrawer() && isLocked()) {
					console.warn(`Drawer is locked, render update is not allowed`)
					return false
				}

				if (drawerInstance.render) {
					timeout = 250
					this.handleDrawerEvent({ eventInstance: "onClose" })
				}

				setTimeout(() => {
					if (typeof instance.options !== "undefined") {
						drawerInstance.options = { ...drawerInstance.options, ...instance.options }
					}

					drawerInstance.render = instance?.fragment
					this.handleUpdateDrawerInstance(drawerInstance)
				}, timeout)
			}
			default:
				break
		}
	}

	renderInstances = () => {
		if (Array.isArray(this.state.instances)) {
			return this.state.instances.map((instance) => {
				return (
					<Drawer visible={instance.component} {...instance.options.props}>
						<React.Fragment>
							{React.createElement(instance.component, {
								...this.props,
								...instance.options.componentProps,
							})}
						</React.Fragment>
					</Drawer>
				)
			})
		}

		return <div></div>
	}

	render() {
		return <div>{this.renderInstances()}</div>
	}
}
