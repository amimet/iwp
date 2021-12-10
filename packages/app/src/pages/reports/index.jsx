import React from "react"
import { ActionsBar, SelectableList } from "components"
import * as antd from 'antd'
import { Icons } from "components/Icons"

export default class Reports extends React.Component {
    state = {
        data: []
    }
    
	api = window.app.request

    componentDidMount = async () => {
        const data = await this.api.get.reports()
        this.setState({ data })
    }

    renderItem = (item) => {
        return <div key={item._id}>
            <div>{item._id}</div>
            <div>{item.name}</div>
        </div>
    }

    onSearch = (value) => {

    }

    createNew = async () => {

    }

    render() {
        return <div>
            <ActionsBar>
                <div>
                    <antd.Button
                        type="primary"
                        onClick={this.createNew}
                        icon={<Icons.Plus />}
                    >
                        New
                    </antd.Button>
                </div>

                <div>
                    <antd.Input.Search
                        placeholder="Search"
                        allowClear
                        onSearch={this.onSearch}
                        onChange={this.onSearch}
                    />
                </div>
            </ActionsBar>
            <SelectableList
                renderItem={this.renderItem}
                items={this.state.data}
            />
        </div>
    }
}