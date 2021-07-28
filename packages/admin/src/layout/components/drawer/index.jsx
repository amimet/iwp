import React from 'react'
import { Controller } from "core/libs"
import * as antd from "antd"

export default class Drawer extends React.Component {
    drawerController = new Controller({ id: "drawer", locked: true })

    state = {
        drawerInstance: {}
    }
    
    componentDidMount() {
        this.drawerController.add(
            "open",
            (fragment, options) => {
                return this.handleDrawerEvent({ eventInstance: "open" }, { fragment, options })
            },
            { lock: true },
        )

        this.drawerController.add(
            "close",
            (to) => {
                return this.handleDrawerEvent({ eventInstance: "onClose" })
            },
            { lock: true },
        )
    }

    handleUpdateDrawerInstance(mutation) {
        if (typeof mutation !== "object") {
            console.warn(`handling drawer instance updates is only allowed with objects`)
            return false
        }
        return this.setState({ drawerInstance: { ...this.state.drawerInstance, ...mutation } })
    }

    handleDrawerEvent(e, instance) {
        let drawerInstance = this.state.drawerInstance

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

    render() {
        return <antd.Drawer
            {...this.state.drawerInstance.options?.props}
            visible={this.state.drawerInstance.render}
        >
            <React.Fragment>
                {this.state.drawerInstance.render && React.createElement(this.state.drawerInstance.render, { ...this.props, ...this.state.drawerInstance.options.componentProps })}
            </React.Fragment>
        </antd.Drawer>
    }
}