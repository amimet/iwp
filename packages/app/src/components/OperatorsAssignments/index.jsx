import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { UserSelector } from "components"

import "./index.less"

export default (props) => {
    const [operatorsData, setOperatorsData] = React.useState([])
    const api = window.app.request

    const onClickAddAssign = () => {
        window.app.DrawerController.open("OperatorAssignment", UserSelector, {
            onDone: async (ctx, data) => {
                if (typeof props.onAssignOperators === "function") {
                    await props.onAssignOperators(ctx, data)
                } else {
                    ctx.close()
                }
            },
            componentProps: {
                select: { roles: ["operator"] },
                excludedIds: props.assigned,
            }
        })
    }

    const fetchOperatorsData = async () => {
        if (!Array.isArray(props.assigned) || props.assigned.length <= 0) {
            return false
        }

        const data = await api.get.users(null, { _id: props.assigned }).catch((err) => {
            console.error(err)
            antd.message.error("Error fetching operators")
            return []
        })

        setOperatorsData(data)
    }

    const onClickRemoveOperator = (_id) => {
        if (typeof props.onRemoveOperator === "function") {
            props.onRemoveOperator(_id)
        }
    }

    React.useEffect(() => {
        fetchOperatorsData()
    }, [])

    return <div className="operators_assignments">
        <div>
            <antd.List
                dataSource={operatorsData}
                renderItem={(item) => {
                    return <antd.List.Item className="operators_assignments item" key={item._id}>
                        <antd.List.Item.Meta
                            avatar={<antd.Avatar src={item.avatar} />}
                            title={item.fullName ?? item.username}
                        />
                        <div className="operators_assignments item actions">
                            <div>
                                <antd.Button onClick={() => { onClickRemoveOperator(item._id) }}>Remove</antd.Button>
                            </div>
                        </div>
                    </antd.List.Item>
                }}
            />
        </div>
        <div className="operators_assignments actions">
            <antd.Button type="primary" onClick={onClickAddAssign}>Add</antd.Button>
        </div>
    </div>
}