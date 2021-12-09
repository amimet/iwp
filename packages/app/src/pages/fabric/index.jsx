import React from "react"
import { ActionsBar, SelectableList } from "components"
import * as antd from "antd"
import { Icons } from "components/Icons"

import "./index.less"

const api = window.app.request

const FabricItemTypesIcons = {
    "product": "Box",
    "operation": "Settings",
    "phase": "GitCommit",
    "task": "Tool",
    "vaultItem": "Archive",
}

export default class FabricList extends React.Component {
    state = {
        selectionEnabled: false,
        data: [],
    }

    componentDidMount = async () => {
        const data = await api.get.fabric()
        
        console.log(data)

        this.setState({ data })
    }

    toogleSelection = (to) => {
        this.setState({ selectionEnabled: to ?? !this.state.selectionEnabled })
    }

    openItem = (key) => {
        console.log("openItem", key)
    }

    renderItem = (item) => {
        const { _id, name, type } = item

        const renderIcon = () => {
            const icon = Icons[FabricItemTypesIcons[type]]

            if (typeof icon !== "undefined") {
                return React.createElement(icon)
            }
            return <div>?</div>
        }

        return <div onClick={() => this.openItem(_id)} className="item" key={_id}>
            <div className="title">
                <div>
                    <h4>{renderIcon()} {type}</h4>
                </div>
                <div>
                    <h1>{name}</h1>
                    <h4>#{_id.toString()}</h4>
                </div>
            </div>
        </div>
    }

    renderFabricTypes = () => {
        return
    }

    render() {
        return <div className="fabric">
            <ActionsBar float={true} wrapperStyle={this.state.selectionEnabled ? { justifyContent: "center" } : null}>
                <div>
                    <antd.Button onClick={() => this.toogleSelection()} type={this.state.selectionEnabled ? "default" : "primary"}>
                        {this.state.selectionEnabled ? "Cancel" : "Select"}
                    </antd.Button>
                </div>
            </ActionsBar>
            <SelectableList
                selectionEnabled={this.state.selectionEnabled}
                items={this.state.data}
                renderItem={this.renderItem}
            />
        </div>
    }
}