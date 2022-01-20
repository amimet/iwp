import React from "react"
import * as antd from "antd"
import { createIconRender } from "components/Icons"
import classnames from "classnames"

import "./index.less"

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
            <div className="bottomBar">
                <div className="items">
                    <div
                        key="main"
                        id="main"
                        className="item"
                        onClick={() => window.app.goMain()}
                    >
                        <div className="icon">
                            {createIconRender("Home")}
                        </div>
                    </div>
                    <div
                        key="nav"
                        id="nav"
                        className="item"
                        onClick={() => this.onClickItemId("nav")}
                    >
                        <div className="icon">
                            {createIconRender("Navigation")}
                        </div>
                    </div>
                    <div
                        key="fabric"
                        id="fabric"
                        className={classnames("item", ["primary"])}
                        onClick={() => window.app.openCreateNew()}
                    >
                        <div className="icon">
                            {createIconRender("PlusCircle")}
                        </div>
                    </div>
                    <div
                        key="settings"
                        id="settings"
                        className="item"
                        onClick={() => window.app.openSettings()}
                    >
                        <div className="icon">
                            {createIconRender("Settings")}
                        </div>
                    </div>
                    {this.props.user ? <div
                        key="account"
                        id="account"
                        className="item"
                        onClick={() => window.app.goToAccount()}
                    >
                        <div className="icon">
                            <antd.Avatar src={this.props.user?.avatar} />
                        </div>
                    </div> : <div
                        key="login"
                        id="login"
                        onClick={() => this.onClickItemId("login")}
                        className="item"
                    >
                        <div className="icon">
                            {createIconRender("LogIn")}
                        </div>
                    </div>}
                </div>
            </div>
        </>
    }
}