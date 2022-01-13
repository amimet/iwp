import React from "react"
import Items from "schemas/routes.json"
import { Icons, createIconRender } from "components/Icons"

import "./index.less"

// TODO: Support childrens
export default class Home extends React.Component {
    onClick = (id) => {
        return false
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

    render() {
        return <div className="navigation">
            <div className="buttons">
                {
                    this.generateItems().map((item, index) => {
                        return this.renderItem(item, index)
                    })
                }
            </div>
        </div>
    }
}