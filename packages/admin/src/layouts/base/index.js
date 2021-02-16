import React from 'react'
import * as antd from 'antd'
import * as Icons from 'components/Icons'
import config from 'config'
import { PageTransition, Layout } from 'components'
import { withRouter, connect, history } from 'umi'
import ngProgress from 'nprogress'
import { enquireScreen, unenquireScreen } from 'enquire-js'

import { Controller } from 'core/libs'

import "./index.less"

@withRouter
@connect(({ loading }) => ({ loading }))
export default class BaseLayout extends React.Component {
    drawerController = new Controller({ id: "drawer", locked: true })
    originPath = window.location.pathname
    state = {
        collapsedSider: false,
        isMobile: null
    }

    toggleCollapseSider = (to) => {
        this.setState({ collapsedSider: (to ?? !this.state.collapsedSider) })
    }

    handleClickBack() {
        history.push(this.originPath)
    }

    componentDidMount() {
        this.drawerController.add("", () => {
            
        })

        this.drawerController.add("close", (to) => {
            return 
        }, { lock: true })

        window.toggleCollapseSider = this.toggleCollapseSider

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

            <Layout.Sider onCollapse={() => this.toggleCollapseSider()} collapsed={this.state.collapsedSider} />
            <antd.Layout className={window.classToStyle("layout")}>
                <Layout.Header handleBack={() => this.handleClickBack()} originPath={this.originPath} siteName={config.app.title} />

                <antd.Layout.Content className={window.classToStyle("wrapper")}>
                    <Layout.Breadcrumb />

                    <PageTransition
                        preset={config.app.defaultTransitionPreset ?? "moveToLeftFromRight"}
                        transitionKey={window.location.pathname}
                    >
                        {children}
                    </PageTransition>

                </antd.Layout.Content>
            </antd.Layout>
        </antd.Layout>
    }
}