import React from 'react'
import * as Icons from 'feather-reactjs'
import { packagejson, config } from 'core'
import { PageTransition } from 'components';
import { withRouter, connect, history } from 'umi'
import "./index.less"
import ngProgress from 'nprogress'
import { enquireScreen, unenquireScreen } from 'enquire-js'

import Header from 'components/ui/header'

@withRouter
@connect(({ loading }) => ({ loading }))
export default class BaseLayout extends React.Component {
    originPath = window.location.pathname
    state = {
        isMobile: null
    }

    handleClickBack() {
        history.push(this.originPath)
    }

    componentDidMount() {
        this.enquireHandler = enquireScreen(mobile => {
            const { isMobile } = this.state
            if (isMobile !== mobile) {
                window.isMobile = mobile
                this.setState({
                    isMobile: mobile,
                })
            }
        })
    }

    componentWillUnmount() {
        unenquireScreen(this.enquireHandler)
    }

    render() {
        const versionDisplay = `Using version ${packagejson.version ?? "invalid"}`
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

        return <React.Fragment>
            <Header handleBack={() => this.handleClickBack()} originPath={this.originPath} siteName={config.app.title} />
            <div className={window.classToStyle("wrapper")} >
                <PageTransition
                    preset={config.app.defaultTransitionPreset ?? "moveToLeftFromRight"}
                    transitionKey={window.location.pathname}
                >
                    {children}
                </PageTransition>
                <div className={window.classToStyle("footer")}>
                    <Icons.Info /> | {versionDisplay} | {config.app.title ?? null}
                </div>
            </div>
        </React.Fragment>
    }
}
