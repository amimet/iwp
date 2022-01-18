import React from "react"
import * as antd from "antd"

export default class Commit extends React.Component {
    state = {
        data: null,
    }

    api = window.app.request

    componentDidMount = async () => {
        this.props.commitToken
        this.props.workloadId
    }

    render() {
        return <div>

        </div>
    }
}