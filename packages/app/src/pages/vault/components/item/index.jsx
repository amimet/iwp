import React from 'react'
import * as antd from 'antd'
import { Icons } from "components/Icons"
import { ModifierTag } from "components"
import classnames from "classnames"
import Statements from "schemas/vaultItemStatements.json"

import "./index.less"

const StatementsOptions = Object.keys(Statements).map((key) => {
    return {
        value: Statements[key].value,
        label: Statements[key].label,
    }
})

export default (props) => {
    let [item, setItem] = React.useState(props.item)
    let [loading, setLoading] = React.useState(false)
    const nameInputRef = React.useRef(null)

    const statement = item.properties?.statement ?? "unknown"

    const onChangeProperties = async (_id, mutation) => {
        if (props.eventDisable) {
            return false
        }

        setLoading(true)
        await props.onChangeProperties(_id, mutation)
            .then((data) => {
                console.log(data)
                setItem(data)
            })
            .catch(error => {
                console.error("Cannot mutate property: ", error)
                antd.notification.error({
                    message: "Cannot mutate property",
                    description: error,
                })
            })

        setLoading(false)
    }

    const cancelEditName = () => {
        setItem({
            ...item,
            name: props.item.name,
        })
        nameInputRef.current.blur()
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

    return <div
        key={item._id}
        className={classnames("vaultItem", { ["compact"]: props.compact })}
        onDoubleClick={props.onDoubleClick}
    >
        <div>
            #{props.compact ? (item.properties?.essc ?? "Deserialized") : item._id}
            <antd.Input
                prefix={loading ? <Icons.LoadingOutlined spin /> : undefined}
                className={classnames("nameInput", { ["eventDisabled"]: props.eventDisable })}
                bordered={false}
                ref={nameInputRef}
                value={item.name}
                onPressEnter={() => {
                    if (props.eventDisable) {
                        return false
                    }
                    onChangeProperties(item._id, { name: nameInputRef.current.state.value })
                    cancelEditName()
                }}
                onChange={(event) => {
                    if (props.eventDisable) {
                        return false
                    }
                    setItem({
                        ...item,
                        name: event.target.value,
                    })
                }}
                onKeyDown={(event) => { event.keyCode == 27 && cancelEditName() }}
            />
        </div>

        <div className="tags">
            <div key="statement" className="tag">
                <ModifierTag
                    icon="Activity"
                    onChangeProperties={(value) => onChangeProperties(item._id, {
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
                    onChangeProperties={(value) => onChangeProperties(item._id, {
                        properties: {
                            location: value,
                        }
                    })}
                    options={fetchLocations}
                    defaultValue={item.properties?.location ?? "unknown"}
                />
            </div>
            <div key="type" className="tag">
                <antd.Tag>
                    <Icons.Tag />
                    <h4>
                        {item.properties?.vaultItemTypeSelector ?? "Other"}
                    </h4>
                </antd.Tag>
            </div>
            {!props.compact &&
                <div key="manufacturer" className="tag">
                    <antd.Tag>
                        <Icons.Home />
                        <h4>
                            {item.properties?.vaultItemManufacturer ?? "Generic"}
                        </h4>
                    </antd.Tag>
                </div>}
            {!props.compact &&
                <div key="serial" className="tag">
                    <antd.Tag>
                        <Icons.Key />
                        <h4>
                            {item.properties?.vaultItemSerial ?? "Deserialized"}
                        </h4>
                    </antd.Tag>
                </div>}
            {!props.compact &&
                <div key="essc" className="tag">
                    <antd.Tag>
                        <Icons.Key />
                        <h4>
                            {item.properties?.essc ?? "Deserialized"}
                        </h4>
                    </antd.Tag>
                </div>}
        </div>
    </div>
}