import React from 'react'
import * as antd from 'antd'
import { Icons } from "components/Icons"
import classnames from "classnames"

import "./index.less"

const StatementsOptions = [
    {
        value: 'active',
        label: 'Active',
    },
    {
        value: 'retired',
        label: 'Retired',
    },
    {
        value: 'unknown',
        label: 'Unknown',
    },
    {
        value: 'storaged',
        label: 'Storaged',
    },
]

const TagColorByStatement = {
    active: 'green',
    retired: 'red',
    unknown: 'orange',
    storaged: 'blue',
}

const RenderItem = (props) => {
    let [item, setItem] = React.useState(props.item)
    const [loading, setLoading] = React.useState(false)

    const statement = item.properties?.statement ?? "unknown"
    const nameInputRef = React.useRef(null)

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

    const openItemDetails = () => {
        if (typeof props.onOpenItemDetails === "function") {
            props.onOpenItemDetails(item._id)
        }
    }

    return <div
        key={item._id}
        className="vaultItem"
    //onDoubleClick={openItemDetails}
    >
        <div>
            #{item._id}
        </div>
        <div>
            <antd.Input
                prefix={loading ? <Icons.LoadingOutlined spin /> : undefined}
                className={classnames("nameInput", {["eventDisabled"]: props.eventDisable})}
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
                <antd.Cascader options={StatementsOptions} onChange={(update) => onChangeProperties(item._id, {
                    properties: {
                        "statement": update[0]
                    }
                })} >
                    <antd.Tag color={TagColorByStatement[statement]}>
                        <Icons.Activity />
                        <h4>
                            {statement}
                        </h4>
                    </antd.Tag>
                </antd.Cascader>
            </div>
            <div key="location" className="tag">
                <antd.Tag>
                    <Icons.Map />
                    <h4>
                        {item.properties?.location ?? "Unlocated"}
                    </h4>
                </antd.Tag>
            </div>
            <div key="type" className="tag">
                <antd.Tag>
                    <Icons.Tag />
                    <h4>
                        {item.properties?.vaultItemTypeSelector ?? "Other"}
                    </h4>
                </antd.Tag>
            </div>
            <div key="manufacturer" className="tag">
                <antd.Tag>
                    <Icons.Home />
                    <h4>
                        {item.properties?.vaultItemManufacturer ?? "Generic"}
                    </h4>
                </antd.Tag>
            </div>
            <div key="manufacturedYear" className="tag">
                <antd.Tag>
                    <Icons.Calendar />
                    <h4>
                        {item.properties?.vaultItemManufacturedYear ?? "Unknown"}
                    </h4>
                </antd.Tag>
            </div>
            <div key="serial" className="tag">
                <antd.Tag>
                    <Icons.Key />
                    <h4>
                        {item.properties?.vaultItemSerial ?? "Deserialized"}
                    </h4>
                </antd.Tag>
            </div>
        </div>
    </div>
}

export default RenderItem