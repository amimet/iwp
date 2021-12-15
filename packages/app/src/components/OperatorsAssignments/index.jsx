import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"

import "./index.less"

export default class OperatorsAssignments extends React.Component {
    state = {
        loading: true,
        data: null,
    }

    api = window.app.request

    componentDidMount = async () => {
        await this.fetchOperatorsData()
    }

    onClickAddAssign = async () => {
        if (typeof this.props.onAssignOperator === "function") {
            const result = await this.props.onAssignOperator()

            if (result) {
                this.fetchOperatorsData()
            }
        }
    }

    onClickRemoveOperator = async (_id) => {
        if (typeof this.props.onRemoveOperator === "function") {
            const result = await this.props.onRemoveOperator(_id)

            if (result) {
                this.fetchOperatorsData()
            }
        }
    }

    fetchOperatorsData = async () => {
        if (!Array.isArray(this.props.assigned) || this.props.assigned.length <= 0) {
            return this.setState({ data: [], loading: false })
        }

        const data = await this.api.get.users(null, { _id: this.props.assigned }).catch((err) => {
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
                        return <antd.List.Item className="operators_assignments item" key={item._id}>
                            <antd.List.Item.Meta
                                avatar={<antd.Avatar src={item.avatar} />}
                                title={item.fullName ?? item.username}
                            />
                            <div className="operators_assignments item actions">
                                <div>
                                    <antd.Button onClick={() => { this.onClickRemoveOperator(item._id) }}>Remove</antd.Button>
                                </div>
                            </div>
                        </antd.List.Item>
                    }}
                />
            </div>
            <div className="operators_assignments actions">
                <antd.Button type="primary" onClick={this.onClickAddAssign}>Add</antd.Button>
            </div>
        </div>
    }
}