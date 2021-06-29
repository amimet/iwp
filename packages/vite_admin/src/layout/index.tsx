import React from 'react'
import * as antd from 'antd'

import config from 'config'
import { Sidebar, Header } from './components'
import { Controller } from 'core/libs'

import "theme/index.less"
import "./index.less"

export default class BaseLayout extends React.Component {
    drawerController = new Controller({ id: "drawer", locked: true })
    layoutContentRef = React.createRef()

    state = {
        drawerInstance: {},
        collapsedSidebar: false
    }

    handleUpdateDrawerInstance(mutation) {
        if (typeof (mutation) !== "object") {
            console.warn(`handling drawer instance updates is only allowed with objects`)
            return false
        }
        return this.setState({ drawerInstance: { ...this.state.drawerInstance, ...mutation } })
    }

    handleDrawerEvent(e, instance) {
        let drawerInstance = this.state.drawerInstance

        const event = { ...e }
        const { eventInstance, type } = event

        if (typeof (eventInstance) !== "string") {
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
                break;
        }
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
        window.busEvent.on("setLocation", (to, delay) => {
            this.handleTransition("leave")
        })
        window.busEvent.on("setLocationReady", (to, delay) => {
            this.handleTransition("enter")
        })

        this.drawerController.add("open", (fragment, options) => {
            return this.handleDrawerEvent({ eventInstance: "open" }, { fragment, options })
        }, { lock: true })

        this.drawerController.add("close", (to) => {
            return this.handleDrawerEvent({ eventInstance: "onClose" })
        }, { lock: true })

        global.applicationEvents.on("cleanAll", () => {
            this.handleDrawerEvent({ eventInstance: "onClose" })
        })
    }

    render() {
        return (
            <React.Fragment>
                <antd.Layout style={{ minHeight: '100vh' }}>

                    <antd.Drawer {...this.state.drawerInstance.options?.props} visible={this.state.drawerInstance.render} >
                        <React.Fragment>{this.state.drawerInstance.render && React.createElement(this.state.drawerInstance.render)}</React.Fragment>
                    </antd.Drawer>

                    <Sidebar onCollapse={() => this.toggleCollapseSider()} collapsed={this.state.collapsedSidebar} />

                    <antd.Layout className="app_layout">
                        <Header siteName={config.app.title} />

                        <antd.Layout.Content className="app_wrapper">
                            <div ref={this.layoutContentRef}>
                                {this.props.children}
                            </div>
                        </antd.Layout.Content>

                    </antd.Layout>

                </antd.Layout>
            </React.Fragment >
        )
    }
}