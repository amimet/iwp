import React from "react"
import * as antd from "antd"
import { createIconRender } from "components/Icons"
import { ActionSheet } from "antd-mobile"
import classnames from "classnames"

import "./index.less"

const Creators = () => {
    const handler = React.useRef()
    const actions = [
        {
            key: "workload",
            text: "Workload",
            onClick: () => {
                window.app.openWorkloadCreator()
                handler.current.close()
            }
        },
        {
            key: "fabric",
            text: "Fabric",
            onClick: () => {
                window.app.openFabric()
                handler.current.close()
            }
        }
    ]

    return <div
        key="fabric"
        id="fabric"
        className={classnames("item", ["primary"])}
        onClick={() => {
            handler.current = ActionSheet.show({ 
                extra: "Select a creator",
                cancelText: "Cancel",
                actions,
            })
        }}
    >
        <div className="icon">
            {createIconRender("PlusCircle")}
        </div>
    </div>
}

export default class BottomBar extends React.Component {
    state = {
        creatorActionsVisible: false,
        render: null,
    }

    componentDidMount = () => {
        window.app.BottomBarController = {
            render: (fragment) => {
                this.setState({ render: fragment })
            },
            clear: () => {
                this.setState({ render: null })
            },
        }
    }

    onClickItemId = (id) => {
        window.app.setLocation(`/${id}`)
    }

    render() {
        if (this.state.render) {
            return <div className="bottomBar">
                {this.state.render}
            </div>
        }

        return <>
            <ActionSheet
                visible={this.state.creatorActionsVisible}
                actions={[
                    {
                        key: "fabric",
                        title: "Fabric",
                        onClick: window.app.openFabric
                    },
                    {
                        key: "workload",
                        title: "Workload",
                    }
                ]}
            />

            <div className="bottomBar">
                <div className="items">
                    <div onClick={() => window.app.goMain()} key="main" id="main" className="item">
                        <div className="icon">
                            {createIconRender("Home")}
                        </div>
                    </div>
                    <div onClick={() => this.onClickItemId("nav")} key="nav" id="nav" className="item" >
                        <div className="icon">
                            {createIconRender("Navigation")}
                        </div>
                    </div>
                    <Creators />
                    <div onClick={() => window.app.openSettings()} key="settings" id="settings" className="item">
                        <div className="icon">
                            {createIconRender("Settings")}
                        </div>
                    </div>
                    {this.props.user ? <div onClick={() => window.app.goToAccount()} key="account" id="account" className="item">
                        <div className="icon">
                            <antd.Avatar src={this.props.user?.avatar} />
                        </div>
                    </div> : <div onClick={() => this.onClickItemId("login")} className="item">
                        <div key="login" id="login" className="icon">
                            {createIconRender("LogIn")}
                        </div>
                    </div>}
                </div>
            </div>
        </>
    }
}