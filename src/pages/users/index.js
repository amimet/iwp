import React from 'react'
import * as antd from 'antd'

export default class Users extends React.Component {
    state = {
        list: []
    }

    componentDidMount() {
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "users"
            },
            callback: (err, res) => {
                console.log(res)
            }
        })
    }

    render() {
        return <antd.List 
            dataSource={this.state.list}
            renderItem={(item) => {
                console.log(item)
                return <div>

                </div>
            }}
        />         
    }
}