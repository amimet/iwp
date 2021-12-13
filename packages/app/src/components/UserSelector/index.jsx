import React from "react"
import * as antd from "antd"

import { SelectableList } from "components"

import "./index.less"

export default class UsersSelector extends React.Component {
    state = {
        loading: true,
        data: [],
    }

    api = window.app.request

    componentDidMount = async () => {
        this.toogleLoading(true)
        await this.fetchUsers()
    }

    toogleLoading = (to) => {
        this.setState({ loading: to ?? !this.state.loading })
    }

    fetchUsers = async () => {
        const data = await this.api.get.users(undefined, this.props.filter).catch((err) => {
            console.error(err)
            antd.message.error("Error fetching operators")
        })

        this.setState({ data: data, loading: false })
    }

    renderItem = (item) => {
        return <div className="user_item">
            <div>
                <antd.Avatar shape="square" src={item.avatar} />
            </div>
            <div>
                <h1>{item.fullName ?? item.username}</h1>
            </div>
        </div>
    }

    render() {
        if (this.state.loading) {
            return <antd.Skeleton active />
        }

        return <div className="users_selector">
                <SelectableList
                    ignoreMobileActions
                    items={this.state.data}
                    renderItem={this.renderItem}
                    actions={[
                        <div call="onDone" key="done">
                            Done
                        </div>
                    ]}
                    onDone={(keys) => this.props.handleDone(keys)}
                />
        </div>
    }
}