import React from "react"
import * as antd from "antd"
import { debounce } from "lodash"
import fuse from "fuse.js"

import { ActionsBar, SelectableList, Skeleton } from "components"
import { Icons, createIconRender } from "components/Icons"
import FORMULAS from "schemas/fabricFormulas"

import "./index.less"

export default class FabricManager extends React.Component {
    state = {
        selectedTypes: [],
        selectionEnabled: false,
        searchValue: null,
        data: [],
    }

    api = window.app.request

    componentDidMount = async () => {
        await this.fetchFabricItems()
    }

    fetchFabricItems = async () => {
        await this.setState({ data: [] })

        let payload = {}

        if (Array.isArray(this.state.selectedTypes) && this.state.selectedTypes.length > 0) {
            payload.select = {
                type: this.state.selectedTypes
            }
        }

        const data = await this.api.get.fabric(undefined, payload).catch((err) => {
            console.error(err)
            antd.message.error(`Failed to load fabric items: ${err}`)
            return false
        })

        if (data) {
            console.log(data)
            return this.setState({ data })
        }
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
            keys: ["name", "_id"],
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

    toogleSelection = (to) => {
        this.setState({ selectionEnabled: to ?? !this.state.selectionEnabled })
    }

    onChangeSelectType = async (value) => {
        await this.setState({ selectedTypes: value })
        await this.fetchFabricItems()
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

    onClickItem = (_id) => {
        console.debug(`Opening Fabric.Inspector with id [${_id}]`)
        window.app.openFabricInspector(_id)
    }

    renderTypesOptions = () => {
        return Object.keys(FORMULAS).map((key) => {
            const formula = FORMULAS[key]

            return <antd.Select.Option key={key} value={key}>
                {Icons[formula.icon] && createIconRender(formula.icon)} {String(key).toTitleCase()}
            </antd.Select.Option>
        })
    }

    parseAsGroups = (objects) => {
        objects = objects.map((obj) => {
            obj.key = obj._id
            
            return obj
        })

        objects = objects.reduce((acc, obj) => {
            if (typeof acc[obj.type] !== "object") {
                acc[obj.type] = []
            }

            acc[obj.type].push(obj)

            return acc
        }, {})

        // return as array
        return Object.keys(objects).map((type) => {
            const formula = FORMULAS[type]

            return {
                label: formula.label ?? String(type).toTitleCase(),
                icon: Icons[formula.icon] && createIconRender(formula.icon),
                children: objects[type],
            }
        })
    }

    renderItem = (item) => {
        const { _id, name } = item

        return <div className="item" key={_id}>
            <div className="title">
                <h1>{name}</h1>
                <h4>#{_id.toString()}</h4>
            </div>
        </div>
    }

    render() {
        return <div className="fabric_manager">
            <ActionsBar mode="float" wrapperStyle={this.state.selectionEnabled ? { justifyContent: "center" } : null}>
                <div key="refresh">
                    <antd.Button icon={<Icons.RefreshCcw style={{ margin: 0 }} />} shape="circle" onClick={this.componentDidMount} />
                </div>
                <div key="toogleSelection">
                    <antd.Button
                        shape="round"
                        icon={this.state.selectionEnabled ? <Icons.Check /> : <Icons.MousePointer />}
                        type={this.state.selectionEnabled ? "default" : "primary"}
                        onClick={() => this.toogleSelection()}
                    >
                        {this.state.selectionEnabled ? "Done" : "Select"}
                    </antd.Button>
                </div>
                <div key="search">
                    <antd.Input.Search
                        placeholder="Search"
                        allowClear
                        onSearch={this.onSearch}
                        onChange={this.onSearch}
                    />
                </div>
                <div key="typeSelector">
                    <antd.Select
                        className="typeSelector"
                        mode="multiple"
                        showSearch
                        placeholder="Select a type"
                        optionFilterProp="children"
                        onChange={this.onChangeSelectType}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {this.renderTypesOptions()}
                    </antd.Select>
                </div>
            </ActionsBar>
            {this.state.data.length === 0 ? <Skeleton /> :
                <SelectableList
                    items={this.parseAsGroups(this.state.searchValue ?? this.state.data)}
                    renderItem={this.renderItem}
                    onClickItem={this.onClickItem}
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
    }
}