import React from "react"
import * as antd from "antd"
import "./index.less"

export default class Operations extends React.Component {
    state = {
        list: []
    }

    api = window.app.request

    componentDidMount = async () => {
        await this.loadOperations()
    }

    loadOperations = async () => {
        const operations = await this.api.get.operations()
        console.log(operations)
    }

    renderItem = (item) => {
        console.log(item)

        return <antd.List.Item>
            {item}
        </antd.List.Item>
    }

    render() {
        return <div className="operations">
            <antd.List
                dataSource={this.state.list}
                renderItem={this.renderItem}
            />
        </div>
    }
}