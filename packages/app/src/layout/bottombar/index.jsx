import React from "react"
import { Icons, createIconRender } from "components/Icons"

import Items from "schemas/routes.json"

import "./index.less"

export default class BottomBar extends React.Component {
    onClickItemId = (id) => {
        window.app.setLocation(`/${id}`)
    }

    generateItems = () => {
        // flatten items.children as new items
        const items = []

        Items.forEach((item) => {
            if (item.children) {
                item.children.forEach((child) => {
                    items.push({ ...child, parent: item.id })
                })
            } else {
                items.push(item)
            }
        })

        return items
    }

    renderItem = (item, index) => {
        return <div
            key={item.id}
            id={item.id}
            onClick={() => this.onClickItemId(item.id)}
            className="item"
        >
            <div className="icon">
                {Icons[item.icon] && createIconRender(item.icon)}
            </div>
        </div>
    }

    render() {
        return <div className="bottomBar">
            <div className="items">
            {
                this.generateItems().map((item, index) => {
                    return this.renderItem(item, index)
                })
            }
            </div>
        </div>
    }
}