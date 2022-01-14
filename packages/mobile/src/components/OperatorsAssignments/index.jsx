import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { UserSelector } from "components"

import "./index.less"

export const Operator = (props) => {
    const { item, onRemove } = props
    const [loading, setLoading] = React.useState(false)

    return <antd.List.Item className="operators_assignments item" key={item._id}>
        <antd.List.Item.Meta
            avatar={<antd.Avatar src={item.avatar} />}
            title={item.fullName ?? item.username}
        />
        <div>
            <antd.Button loading={loading} disabled={loading} onClick={() => {
                setLoading(true)
                setTimeout(() => {
                    onRemove()
                }, 250)
            }}>Remove</antd.Button>
        </div>
    </antd.List.Item>
}

export default class OperatorsAssignments extends React.Component {
    state = {
        loading: true,
        data: null,
        assigned: (this.props?.assigned && Array.isArray(this.props?.assigned) ? this.props?.assigned : [] ) ?? [],
    }

    api = window.app.request

    componentDidMount = async () => {
        await this.fetchOperatorsData()
    }

    onClickAddAssign = async () => {
        return new Promise((resolve, reject) => {
            window.app.DrawerController.open("OperatorAssignment", UserSelector, {
                onDone: async (ctx, data) => {
                    if (data.length <= 0) {
                        ctx.close()
                        return false
                    }

                    let assigned = this.state.assigned

                    assigned = [...assigned, ...data]

                    await this.setState({ assigned })

                    if (typeof this.props.onAssignOperator === "function") {
                        await this.props.onAssignOperator(data)
                    }

                    await this.fetchOperatorsData()
                    ctx.close()
                },
                componentProps: {
                    select: { roles: ["operator"] },
                    excludedIds: this.state.assigned,
                }
            })
        })
    }

    onClickRemoveOperator = async (_id) => {
        if (typeof this.props.onRemoveOperator === "function") {
            let assigned = this.state.assigned

            assigned = assigned.filter((id) => id !== _id)

            await this.setState({ assigned })

            if (typeof this.props.onRemoveOperator === "function") {
                await this.props.onRemoveOperator(_id)
            }

            await this.fetchOperatorsData()
        }
    }

    fetchOperatorsData = async () => {
        if (!Array.isArray(this.state.assigned) || this.state.assigned.length <= 0) {
            return this.setState({ data: [], loading: false })
        }

        const data = await this.api.get.users(null, { _id: this.state.assigned }).catch((err) => {
            console.error(err)
            antd.message.error("Error fetching operators")
            return []
        })

        this.setState({ data, loading: false })
    }

    render() {
        if (this.state.loading) {
            return <antd.Skeleton active />
        }
        return <div className="operators_assignments">
            <div>
                <antd.List
                    dataSource={this.state.data}
                    renderItem={(item) => {
                        return <Operator item={item} onRemove={() => this.onClickRemoveOperator(item._id)} />
                    }}
                />
            </div>
            <div className="operators_assignments actions">
                <div key="add">
                    <antd.Button icon={<Icons.Plus />} shape="round" onClick={this.onClickAddAssign}>Add</antd.Button>
                </div>
            </div>
        </div>
    }
}