import React from 'react'
import * as antd from 'antd'
import config from 'config'
import { PageTransition, Layout } from 'components'
import { withRouter, connect, history } from 'umi'
import ngProgress from 'nprogress'
import { enquireScreen, unenquireScreen } from 'enquire-js'

import { Controller } from 'core/libs'
import { setLocation } from 'core'

import "theme/index.less"
import "./index.less"

@withRouter
@connect(({ loading }) => ({ loading }))
export default class BaseLayout extends React.Component {
    drawerController = new Controller({ id: "drawer", locked: true })
    layoutContentRef = React.createRef()

    originPath = window.location.pathname
    state = {
        drawerInstance: {},
        collapsedSidebar: false,
        isMobile: null
    }

    handleClickBack() {
        setLocation(this.originPath)
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
        const oldClass = current.className

        if(state === "leave"){
            current.className = `fade-transverse-active fade-transverse-leave-to`
        }else {
            current.className = `fade-transverse-active fade-transverse-enter-to`
        }
    }

    componentDidMount() {
        if (typeof window.busEvent === "undefined") {
            throw new Error(`BusEvent is not available`)
        }

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

        this.enquireHandler = enquireScreen(mobile => {
            const { isMobile } = this.state
            if (isMobile !== mobile) {
                window.isMobile = mobile
                this.setState({
                    isMobile: mobile
                })
            }
        })
    }

    componentWillUnmount() {
        unenquireScreen(this.enquireHandler)
    }

    render() {
        const { children, loading } = this.props

        ngProgress.configure({ parent: "#root", showSpinner: true })
        ngProgress.start()

        if (window.location.pathname !== this.originPath) {
            ngProgress.start()
        }

        if (!loading.global) {
            ngProgress.set(0.9)
            setTimeout(() => {
                ngProgress.done()
            }, 150)
        }

        return <antd.Layout style={{ minHeight: '100vh' }}>
            <antd.Drawer {...this.state.drawerInstance.options?.props} visible={this.state.drawerInstance.render} >
                <React.Fragment>{this.state.drawerInstance.render && React.createElement(this.state.drawerInstance.render)}</React.Fragment>
            </antd.Drawer>
            <Layout.Sider onCollapse={() => this.toggleCollapseSider()} collapsed={this.state.collapsedSidebar} />
            <antd.Layout className={window.classToStyle("layout")}>
                <Layout.Header handleBack={() => this.handleClickBack()} originPath={this.originPath} siteName={config.app.title} />

                <antd.Layout.Content className={window.classToStyle("wrapper")}>
                    <div ref={this.layoutContentRef}>
                        {children}
                    </div>
                </antd.Layout.Content>
            </antd.Layout>
        </antd.Layout>
    }
}