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

    const fetchItemDetails = async () => {
        const api = window.app.request
        const data = await api.get.fabric({ _id: itemId }, { _id: itemId }).catch(err => {
            setError(err)
        })

        if (typeof data[0] !== "undefined") {
            setItem(data[0])
            console.log(data[0])
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

    React.useEffect(() => {
        fetchItemDetails()
    }, [])

    if (error) {
        return <div>
            Error: {error}
        </div>
    }
    if (!item) {
        return <antd.Skeleton active />
    }

    const statement = item.properties?.statement ?? "unknown"

    return <div className="itemDetails">
        <div className="header">
            <h1>{item.name}</h1>
            <h4>#{item._id}</h4>
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
                        defaultValue={statement}
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
                    <h2>{item.properties?.essc}</h2>
                </div>
            </div>
        </div>
    </div>
}