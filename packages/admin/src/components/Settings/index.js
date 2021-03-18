import React from 'react'
import * as Icons from 'components/Icons'
import * as antd from 'antd'

import styles from './index.less'

const ItemTypes = {
    Button: antd.Button,
    Switch: antd.Switch,
    Slider: antd.Slider,
    Checkbox: antd.Checkbox,
    Input: antd.Input,
    InputNumber: antd.InputNumber,
    Select: antd.Select
}

let settingList = require("schemas/settingsList.json") // Index Order sensitive !!!
let groupsDecorator = require("schemas/settingsGroupsDecorator.json")
let handlers = require("core/handlers").default.settings ?? {}

const controller = {
    open: (key) => {
        // TODO: Scroll to content
        window.controllers.drawer.open(SettingsController, {
            props: {
                onClose: controller.close,
                width: "45%"
            }
        })
    },

    close: () => {
        window.controllers.drawer.close()
    }
}

export class SettingsController extends React.Component {

    handleEvent(event, id, type) {
        if (typeof (type) !== "string") {
            console.error(`Invalid eventType data-type, expecting string!`)
            return false
        }

        if (typeof (handlers[id]) == "undefined") {
            console.warn(`No handler for ${id}`)
            return false
        }

        let dispatch = "click"

        switch (type.toLowerCase()) {
            case "button": {
                dispatch = "click"
                break
            }
            case "switch": {
                dispatch = event ? "enable" : "disable"
                break
            }
            default: {
                // like button (onClick)
                dispatch = "click"
                break
            }
        }

        if (typeof (handlers[id][dispatch]) == "function") {
            handlers[id][dispatch]()
        }
    }

    generateMenu(data) {
        let items = {}

        const _event = this.handleEvent
        function renderGroupItems(group) {
            return items[group].map((item) => {
                if (!item.type) {
                    console.error(`Item [${item.id}] has no an type!`)
                    return null
                }
                return <div key={item.id}>
                    <h5> {item.icon ? React.createElement(Icons[item.icon]) : null}{item.title ?? item.id} </h5>
                    {item.render ?? React.createElement(ItemTypes[item.type], {
                        onClick: (e) => _event(e, item.id ?? "anon", item.type),
                        children: item.title ?? item.id,
                        ...item.props
                    })}
                </div>
            })
        }

        function renderGroupDecorator(group) {
            if (group === "none") {
                return null
            }
            const fromDecoratorIcon = groupsDecorator[group]?.icon
            const fromDecoratorTitle = groupsDecorator[group]?.title

            return <div>
                <h1>{fromDecoratorIcon ? React.createElement(Icons[fromDecoratorIcon]) : null} {fromDecoratorTitle ?? group}</h1>
            </div>
        }

        if (Array.isArray(data)) {
            data.forEach((item) => {
                if (typeof (item.group) == "undefined") {
                    item.group = "none"
                }

                if (!items[item.group]) {
                    items[item.group] = []
                }

                items[item.group].push(item)
            })
        }

        return Object.keys(items).map((group) => {
            return <div style={{ marginBottom: "30px" }}>
                {renderGroupDecorator(group)}
                <div key={group} className={styles.groupItems} >
                    {renderGroupItems(group)}
                </div>
            </div>
        })
    }

    render() {
        return <div>
            {this.generateMenu(settingList)}
        </div>
    }
}

export default controller