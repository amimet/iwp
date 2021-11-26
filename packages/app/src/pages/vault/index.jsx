import React from 'react'
import * as antd from 'antd'
import { Icons } from "components/Icons"
import { ActionsBar, SelectableList } from 'components'
import { ItemRender, ItemDetails } from './components'
import classnames from 'classnames'

import "./index.less"

const api = window.app.request

export default class Vault extends React.Component {
    state = {
        compactView: false,
        selectionEnabled: false,
        data: null
    }

    componentDidMount = async () => {
        await this.loadFabricItems()
    }

    loadFabricItems = async () => {
        this.setState({ data: null })
        const vault = await api.get.fabric(undefined, { type: "vaultItem", additions: ["vaultItemParser"] })
        this.setState({ data: vault })
    }

    toogleSelection = (to) => {
        this.setState({ selectionEnabled: to ?? !this.state.selectionEnabled })
    }

    toogleCompactView = (to) => {
        this.setState({ compactView: to ?? !this.state.compactView })
    }

    dumpData = () => {
        // TODO: Implement dump data form api method
    }

    onChangeProperties = async (_id, mutation) => {
        return api.post.fabric({
            _id,
            mutation,
        })
    }

    onOpenItemDetails = (_id) => {
        app.DrawerController.open("ItemDetails", ItemDetails, {
            props: {
                width: "50%",
            },
            componentProps: {
                id: _id,
                onChangeProperties: this.onChangeProperties,
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
        return (
            <div className="vaultItems">
                <ActionsBar float={true}>
                    <div key="refresh">
                        <antd.Button icon={<Icons.RefreshCcw style={{ margin: 0 }} />} shape="circle" onClick={this.loadFabricItems} />
                    </div>
                    <div key="toogleSelect">
                        <antd.Button shape="round" icon={this.state.selectionEnabled ? <Icons.Check /> : <Icons.MousePointer />} type={this.state.selectionEnabled ? "default" : "primary"} onClick={() => this.toogleSelection()}>
                            {this.state.selectionEnabled ? "Done" : "Select"}
                        </antd.Button>
                    </div>
                    <div key="createNew">
                        <antd.Button icon={<Icons.Plus />} type="primary" onClick={() => { window.app.openFabric("vaultItem") }}>
                            New
                        </antd.Button>
                    </div>
                    <div key="exportData">
                        <antd.Button icon={<Icons.Save />} onClick={() => this.dumpData()}>
                            Export
                        </antd.Button>
                    </div>
                    <div key="compactView">
                        <h5>Compact view</h5>
                        <antd.Switch checked={this.state.compactView} onChange={(e) => this.toogleCompactView(e)} />
                    </div>
                </ActionsBar>
                <div
                    className={classnames(
                        "list",
                        (this.state.selectionEnabled ? ["selectionEnabled"] : ["selectionDisabled"]),
                        { ["compact"]: this.state.compactView }
                    )}
                >
                    {!this.state.data ? <antd.Skeleton active /> :
                        <SelectableList
                            selectionEnabled={this.state.selectionEnabled}
                            items={this.state.data}
                            renderItem={(item) => <ItemRender onDoubleClick={() => this.onOpenItemDetails(item._id)} compact={this.state.compactView} eventDisable={this.state.selectionEnabled} item={item} onChangeProperties={this.onChangeProperties} onOpenItemDetails={this.onOpenItemDetails} />}
                            onDelete={this.onDeleteItems}
                            actions={[
                                <div key="delete" call="onDelete">
                                    <Icons.Trash />
                                    Delete
                                </div>,
                            ]}
                        />}
                </div>
            </div>
        )
    }
}