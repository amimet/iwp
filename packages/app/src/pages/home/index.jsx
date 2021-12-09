import React from "react"
import Items from "schemas/sidebar.json"
import { Icons, createIconRender } from "components/Icons"

import "./index.less"

// TODO: Support childrens
export default class Home extends React.Component {
    onClick = (id) => {
        window.app.setLocation(id)
    }

    renderItem = (item, index) => {
        return <div
            key={item.id}
            id={item.id}
            onClick={() => this.onClick(item.id)}
            className="item"
        >
            <div className="icon">
                {Icons[item.icon] && createIconRender(item.icon)}
            </div>
            <div className="name">
                <h1>{item.title ?? item.id}</h1>
            </div>
        </div>
    }

    componentDidMount() {
        window.app.eventBus.on("desktop_mode", () => {
            window.app.setLocation("/main")
        })
    }

    render() {
        if (!window.isMobile) {
            window.app.setLocation("/main")
            return null
        }

        return <div className="buttons_menu">
            {
                Items.map((item, index) => {
                    return this.renderItem(item, index)
                })
            }
        </div>
    }
}