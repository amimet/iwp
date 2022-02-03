import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { ActionsBar, SelectableList } from "components"
import { ItemRender, ItemDetails, ImportTool } from "./components"
import classnames from "classnames"
import { debounce } from "lodash"
import fuse from "fuse.js"

import "./index.less"

// TODO: Filter items by type

export default class Vault extends React.Component {
    state = {
        locations: [],
        compactView: false,
        selectionEnabled: false,
        data: null,
        searchValue: null,
    }

    api = window.app.request

    itemListRef = React.createRef()

    componentDidMount = async () => {
        await this.loadFabricItems()
        await this.loadLocations()
    }

    loadLocations = async () => {
        const locations = await this.fetchLocations()
        this.setState({ locations })
    }

    loadFabricItems = async () => {
        const vault = await this.fetchFabricItems()

        this.setState({ data: null }, () => {
            this.setState({ data: vault })
        })
    }

    fetchLocations = async () => {
        const sections = await this.api.get.sections().catch(err => {
            return []
        })

        return sections.map((section) => {
            return {
                value: section.name,
                label: section.name,
            }
        })
    }

    fetchFabricItems = async () => {
        return await this.api.get.fabric(undefined, { type: "vaultItem", additions: ["vaultItemParser"] })
    }

    toogleSelection = (to) => {
        this.setState({ selectionEnabled: to ?? !this.state.selectionEnabled })
    }

    toogleCompactView = (to) => {
        this.setState({ compactView: to ?? !this.state.compactView })
    }

    dumpData = async () => {
        let vault = await this.api.get.fabric(undefined, { type: "vaultItem", additions: ["vaultItemParser"] })
        let parsed = vault.map(item => {
            return {
                _id: item._id,
                name: item.name,
                ...item.properties,
                serial: item.properties.serial ?? null,
                manufacturer: item.properties.manufacturer ?? null,
                type: item.properties.type ?? null,
            }
        })

        let data = JSON.stringify(parsed, null, 2)
        let blob = new Blob([data], { type: "application/json" })
        let url = URL.createObjectURL(blob)
        let a = document.createElement("a")

        a.href = url
        a.download = `vault_export-${new Date().getTime()}.json`
        a.click()
    }

    importData = async () => {
        window.app.DrawerController.open("ImportTool", ImportTool, {
            props: {
                width: "70%",
            },
            onDone: async (ctx, changes) => {
                const result = await this.onImportData(changes).catch(error => {
                    ctx.events.emit("error", error)
                })

                if (result) {
                    this.setState({ searchValue: null, data: result })
                    ctx.close()
                }
            }
        })
    }

    search = (value) => {
        if (typeof value !== "string") {
            if (typeof value.target?.value === "string") {
                value = value.target.value
            }
        }

        if (value === "") {
            return this.setState({ searchValue: null })
        }

        const searcher = new fuse(this.state.data, {
            includeScore: true,
            keys: ["_id", "essc", "name",],
        })

        const result = searcher.search(value)

        this.setState({
            searchValue: result.map((entry) => {
                return entry.item
            }),
        })
    }

    debouncedSearch = debounce((value) => this.search(value), 500)

    onSearch = (event) => {
        if (event === "" && this.state.searchValue) {
            return this.setState({ searchValue: null })
        }

        this.debouncedSearch(event.target.value)
    }

    onImportData = async (changes) => {
        return this.api.put.fabricImport({
            data: changes.map((change) => {
                return {
                    ...change.new,
                    _id: change._id,
                }
            }), additions: ["essc"], type: "vaultItem"
        })
    }

    onChangeProperties = async (_id, mutation) => {
        return this.api.post.fabric({
            _id,
            mutation,
        })
    }

    onOpenItemDetails = (_id) => {
        if (this.state.selectionEnabled) {
            return false
        }

        app.DrawerController.open("ItemDetails", ItemDetails, {
            props: {
                width: "50%",
            },
            componentProps: {
                id: _id,
                onChangeProperties: this.onChangeProperties,
            },
        })
    }

    onDeleteItems = async (items) => {
        antd.Modal.confirm({
            content: `Are you sure you want to delete ${items.length} item(s)?`,
            onOk: async () => {
                await this.api.delete.fabric({ _id: items, type: "vaultItem" })
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
                <ActionsBar mode="float">
                    <div key="refresh">
                        <antd.Button icon={<Icons.RefreshCcw style={{ margin: 0 }} />} shape="circle" onClick={this.loadFabricItems} />
                    </div>
                    <div key="toogleSelection">
                        <antd.Button shape="round" icon={this.state.selectionEnabled ? <Icons.Check /> : <Icons.MousePointer />} type={this.state.selectionEnabled ? "default" : "primary"} onClick={() => this.toogleSelection()}>
                            {this.state.selectionEnabled ? "Done" : "Select"}
                        </antd.Button>
                    </div>
                    {this.state.selectionEnabled &&
                        <div key="selectAll">
                            <antd.Button shape="round" onClick={() => this.itemListRef.current.selectAll()}>
                                Select all
                            </antd.Button>
                        </div>}
                    <div key="createNew">
                        <antd.Button icon={<Icons.Plus />} type="primary" onClick={() => { window.app.openFabric("vaultItem") }}>
                            New
                        </antd.Button>
                    </div>
                    <div key="exportData">
                        <antd.Button icon={<Icons.Save />} onClick={this.dumpData}>
                            Export
                        </antd.Button>
                    </div>
                    <div key="importData">
                        <antd.Button icon={<Icons.Upload />} onClick={this.importData}>
                            Import
                        </antd.Button>
                    </div>
                    <div key="compactView">
                        <h5>Compact view</h5>
                        <antd.Switch checked={this.state.compactView} onChange={(e) => this.toogleCompactView(e)} />
                    </div>
                    <div key="search">
                        <antd.Input.Search
                            placeholder="Search"
                            allowClear
                            onSearch={this.onSearch}
                            onChange={this.onSearch}
                        />
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
                            ref={this.itemListRef}
                            selectionEnabled={this.state.selectionEnabled}
                            items={this.state.searchValue ?? this.state.data}
                            renderItem={(item) => <ItemRender locations={this.state.locations} onDoubleClick={() => this.onOpenItemDetails(item._id)} compact={this.state.compactView} eventDisable={this.state.selectionEnabled} item={item} onChangeProperties={this.onChangeProperties} onOpenItemDetails={this.onOpenItemDetails} />}
                            actions={[
                                <div key="delete" call="onDelete">
                                    <Icons.Trash />
                                    Delete
                                </div>,
                            ]}
                            events={{
                                onDelete: this.onDeleteItems,
                            }}
                        />}
                </div>
            </div>
        )
    }
}