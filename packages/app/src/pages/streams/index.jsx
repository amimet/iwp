import React from 'react'
import axios from "axios"
import * as antd from "antd"
import { SelectableList } from "components"

// http://192.168.1.144:8080/live/srgooglo_ff.m3u8
const streamsApi = "http://192.168.1.144:1985/api/v1"
const bridge = axios.create({
    baseURL: streamsApi,
})

export default class Streams extends React.Component {
    state = {
        list: [],
    }

    updateStreamsList = async () => {
        const streams = ((await bridge.get("/streams")).data).streams
        this.setState({ list: streams })
    }

    componentDidMount = async () => {
        this.updateStreamsList()
    }

    onClickItem = (item) => {
        window.app.setLocation(`/streams/viewer?key=${item.name}`)
    }

    renderListItem = (item) => {
        console.log(item)
        return <div key={item.id} onClick={() => this.onClickItem(item)}>
            <h1>@{item.name} #{item.id}</h1>
        </div>
    }

    render() {
        return <div>
            <h1>Streams</h1>
            <div>
                <SelectableList 
                    selectionEnabled={false}
                    renderItem={this.renderListItem}
                    items={this.state.list}
                />
            </div>
        </div>
    }
}