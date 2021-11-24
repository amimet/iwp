import React from 'react'
import * as antd from 'antd'
import { Icons } from "components/Icons"
import { ActionsBar, SelectableList } from 'components'
import { ItemRender } from './components'
import classnames from 'classnames'

import "./index.less"

const api = window.app.request

export default class Vault extends React.Component {
    state = {
        selectionEnabled: false,
        data: null
    }

    componentDidMount = async () => {
        const vault = await api.get.fabric(undefined, { type: "vaultItem" })

        this.setState({ data: vault })
    }

    toogleSelection = (to) => {
        this.setState({ selectionEnabled: to ?? !this.state.selectionEnabled })
    }

    onChangeProperties = async (_id, mutation) => {
        return api.post.fabric({
            _id,
            mutation,
        })
    }

    onOpenItemDetails = (_id) => {
        // TODO: Create a detailed view for vault items
        console.log("Open item details: ", _id)
        app.DrawerController.open("ItemDetails", ItemDetails, {
            componentProps: {
                id: _id,
            }
        })
    }

    onDeleteItems = async (items) => {
        antd.Modal.confirm({
            content: `Are you sure you want to delete ${items.length} item(s)?`,
            onOk: async () => {
                await api.delete.fabric({ _id: items })
                    .then((data) => {
                        this.setState({ data: data })
                        this.toogleSelection(false)
                    })
                    .catch(error => {
                        console.error("Cannot delete items: ", error)
                        antd.notification.error({
                            message: "Cannot delete items",
                            description: error,
                        })
                    })

            },
        })
    }

    render() {
        if (!this.state.data) {
            return <antd.Skeleton active />
        }

        return (
            <div className="vaultItems">
                <ActionsBar>
                    <div>
                        <antd.Button type="primary" onClick={() => { window.app.openFabric("vaultItem") }}>
                            New
                        </antd.Button>
                    </div>
                    <div>
                        <antd.Button type={this.state.selectionEnabled ? "default" : "primary"} onClick={() => this.toogleSelection()}>
                            {this.state.selectionEnabled ? "Cancel" : "Select"}
                        </antd.Button>
                    </div>
                </ActionsBar>
                <div className={classnames("list", (this.state.selectionEnabled ? ["selectionEnabled"] : ["selectionDisabled"]))}>
                    <SelectableList
                        selectionEnabled={this.state.selectionEnabled}
                        items={this.state.data}
                        renderItem={(item) => <ItemRender eventDisable={this.state.selectionEnabled} item={item} onChangeProperties={this.onChangeProperties} onOpenItemDetails={this.onOpenItemDetails} />}
                        onDelete={this.onDeleteItems}
                        actions={[
                            <div key="delete" call="onDelete">
                                <Icons.Trash />
                                Delete
                            </div>,
                        ]}
                    />
                </div>
            </div>
        )
    }
}