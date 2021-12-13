import React from "react"
import * as antd from "antd"
import { createIconRender } from "components/Icons"

import "./index.less"

export default class BottomBar extends React.Component {
    onClickItemId = (id) => {
        window.app.setLocation(`/${id}`)
    }

    render() {
        return <div className="bottomBar">
            <div className="items">
                <div onClick={() => window.app.goMain()} key="main" id="main" className="item">
                    <div className="icon">
                        {createIconRender("Home")}
                    </div>
                </div>
                <div onClick={() => this.onClickItemId("nav")} key="nav" id="nav" className="item">
                    <div className="icon">
                        {createIconRender("Navigation")}
                    </div>
                </div>
                <div onClick={() => window.app.openSettings()} key="settings" id="settings" className="item">
                    <div className="icon">
                        {createIconRender("Settings")}
                    </div>
                </div>
                <div onClick={() => window.app.goToAccount()} key="account" id="account" className="item">
                    <div className="icon">
                        <antd.Avatar src={this.props.user?.avatar} />
                    </div>
                </div>
            </div>
        </div>
    }
}