import React from "react"
import * as antd from "antd"

import { Skeleton } from "components"

import "./index.less"

export default class WorkorderResult extends React.Component {
    state = {
        data: {},
    }

    api = window.app.request

    componentDidMount = async () => {
        this.id = this.props.id

        if (!this.id) {
            console.error("WorkorderResult: id is required")
            return false
        }

        const workorder = await this.fetchWorkorderData(this.id)

        if (workorder) {
            this.setState({
                data: workorder,
            })
        }
    }

    fetchWorkorderData = async (id) => {
        const result = await this.api.get.workorder(undefined, { _id: id }).catch((error) => {
            console.error(error)
            antd.message.error(error.message)
            return false
        })

        return result
    }

    render() {
        if (!this.state.data) {
            return <Skeleton />
        }

        return <div className="workorderResult">
            
        </div>
    }
}