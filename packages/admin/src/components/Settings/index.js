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

export class SettingsMenu extends React.Component {
    settingController = global.settingsController

    state = {
        settings: this.settingController.get() ?? {}
    }

    _set(key, value) {
        this.setState({ settings: this.settingController.change(key, value) })
    }

    handleEvent(event, id, type) {
        if (typeof id === "undefined") {
            console.error(`No setting id provided!`)
            return false
        }
        if (typeof type !== "string") {
            console.error(`Invalid eventType data-type, expecting string!`)
            return false
        }

        const value = this.settingController.get(id) ?? false
        let to = !value

        switch (type.toLowerCase()) {
            case "button": {
                this.settingController.events.emit("changeSetting", { event, id, value, to })
                break
            }
            default: {
                this._set(id, to)
                break
            }
        }

    }

    generateMenu(data) {
        let items = {}

        const renderGroupItems = (group) => {
            return items[group].map((item) => {
                if (!item.type) {
                    console.error(`Item [${item.id}] has no an type!`)
                    return null
                }

                if (typeof item.props === "undefined") {
                    item.props = {}
                }

                switch (item.type.toLowerCase()) {
                    case "switch": {
                        item.props.checked = this.state.settings[item.id]
                        break
                    }

                    default: {
                        item.props.value = this.state.settings[item.id]
                        break
                    }
                }
                return <div key={item.id}>
                    <h5> {item.icon ? React.createElement(Icons[item.icon]) : null}{item.title ?? item.id} </h5>
                    {item.render ?? React.createElement(ItemTypes[item.type], {
                        onClick: (e) => this.handleEvent(e, item.id ?? "anon", item.type),
                        children: item.title ?? item.id,
                        ...item.props
                    })}
                </div>
            })
        }

        const renderGroupDecorator = (group) => {
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
            return <div key={group} style={{ marginBottom: "30px" }}>
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

const controller = {
    open: (key) => {
        // TODO: Scroll to content
        window.controllers.drawer.open(SettingsMenu, {
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

export default controller