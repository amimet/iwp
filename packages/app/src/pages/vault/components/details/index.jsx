import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { ModifierTag } from "components"
import Statements from "schemas/vaultItemStatements.json"

import "./index.less"

const StatementsOptions = Object.keys(Statements).map((key) => {
    return {
        value: Statements[key].value,
        label: Statements[key].label,
    }
})

export default (props) => {
    const itemId = props.id ?? props._id

    if (typeof itemId === "undefined") {
        return <div>
            No ID provided
        </div>
    }

    const [item, setItem] = React.useState(null)
    const [error, setError] = React.useState(null)

    const fetchItemData = async () => {
        const api = window.app.request
        const data = await api.get.fabric(undefined, { _id: itemId, additions: ["vaultItemParser"] }).catch(err => {
            setError(err)
        })

        if (typeof data[0] !== "undefined") {
            setItem(data[0])
        }
    }

    const fetchLocations = async () => {
        const api = window.app.request
        const regions = await api.get.regions().catch(err => {
            setError(err)
        })

        return regions.map((region) => {
            return {
                value: region.name,
                label: region.name,
            }
        })
    }

    const fetchTypes = async () => {
        let types = await import("schemas/vaultItemsTypes.json")

        types = types.default || types

        return Object.keys(types).map((group) => {
            return {
                value: group,
                label: String(group).toTitleCase(),
                children: types[group].map((type) => {
                    return {
                        value: type,
                        label: String(type).toTitleCase(),
                    }
                }),
            }
        })
    }

    React.useEffect(() => {
        fetchItemData()
    }, [])

    if (error) {
        return <div>
            Error: {error}
        </div>
    }
    if (!item) {
        return <antd.Skeleton active />
    }

    return <div className="itemDetails">
        <div className="header">
            <h1 style={{ userSelect: "all" }}>{item.name}</h1>
            <h4 style={{ userSelect: "all" }}>#{item._id}</h4>
            <div className="tags">
                <div key="statement" className="tag">
                    <ModifierTag
                        icon="Activity"
                        onChangeProperties={(value) => props.onChangeProperties(item._id, {
                            properties: {
                                statement: value,
                            }
                        })}
                        colors={Object.fromEntries(Object.keys(Statements).map((key) => {
                            return [key, Statements[key].tagColor]
                        }))}
                        options={StatementsOptions}
                        defaultValue={item.properties?.statement}
                    />
                </div>
                <div key="location" className="tag">
                    <ModifierTag
                        icon="Map"
                        onChangeProperties={(value) => props.onChangeProperties(item._id, {
                            properties: {
                                location: value,
                            }
                        })}
                        options={fetchLocations}
                        defaultValue={item.properties?.location ?? "unknown"}
                    />
                </div>
                <div key="type" className="tag">
                    <ModifierTag
                        icon="Disc"
                        onChangeProperties={(value) => props.onChangeProperties(item._id, {
                            properties: {
                                vaultItemTypeSelector: value.join("-"),
                            }
                        })}
                        options={fetchTypes}
                        defaultValue={item.properties?.type ?? "Other"}
                    />
                </div>
            </div>
        </div>

        <div className="properties">
            <div key="essc" className="entry">
                <div className="title">
                    <div>
                        <h2>
                            <Icons.Key />
                            ESSC
                        </h2>
                    </div>
                    <div>
                        <antd.Button><Icons.RefreshCw /> Regenerate</antd.Button>
                    </div>
                </div>
                <div className="content">
                    <h2 style={{ userSelect: "all" }}>{item.properties?.essc}</h2>
                </div>
            </div>
            <div key="serial" className="entry">
                <div className="title">
                    <div>
                        <h2>
                            <Icons.Key />
                            Serial
                        </h2>
                    </div>
                </div>
                <div className="content">
                    <h2 style={{ userSelect: "all" }}>{item.properties?.serial}</h2>
                </div>
            </div>
        </div>
    </div>
}