import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@nodecorejs/utils'
import { api } from 'interface'

export default class Users extends React.Component {
    state = {
        users: {},
        list: [],
        openUser: null,
        selectedUsers: [],
    }

    componentDidMount() {
        console.log(api)
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "users"
            },
            callback: (err, res) => {
                let updated = {}
                objectToArrayMap(res.data).forEach((user) => {
                    updated[user.value.username] = user.value
                })
                this.setState({ users: updated, list: res.data })
            }
        })
    }

    selectUser(user) {

    }

    openUserDrawer(user) {
        if (typeof(user) == "string") {
            this.setState({ openUser: user })
        }else {
            console.log(`Invalid data`)
        }
    }

    closeUserDrawer() {
        this.setState({ openUser: null })
    }

    renderRoles(roles) {
        return roles.map((role) => {
            return <antd.Tag key={role} > {role} </antd.Tag>
        })
    }

    renderUserDrawer() {
        const userData = this.state.users[this.state.openUser]
        if (typeof (userData) !== "undefined") {
            return <div>
                {userData.username}
            </div>
        }
    }

    render() {
        return <div>
            <antd.Drawer
                onClose={() => { this.closeUserDrawer() }}
                visible={this.state.openUser}
            >
                {this.renderUserDrawer()}
            </antd.Drawer>
            <antd.List
                dataSource={this.state.list}
                renderItem={(item) => {
                    console.log(item)
                    return <div onDoubleClick={() => this.openUserDrawer(item.username)} onClick={() => this.selectUser(item.username)} key={item._id} className={window.classToStyle("user_card")}>
                        <div>
                            <antd.Avatar shape="square" src={item.avatar || "https://www.flaticon.com/svg/static/icons/svg/149/149071.svg"} />
                        </div>
                        <div className={window.classToStyle("user_card_title")}>
                            <div style={{ width: "100%", height: "33px" }}>
                                <div style={{ float: "left" }}>
                                    <h1>{item.fullName ? item.fullName : null}</h1>
                                </div>
                                <div style={{ float: "right" }}>
                                    {this.renderRoles(item.roles)}
                                </div>
                            </div>
                            <div>
                                <h3>@{item.username}#{item._id}</h3>
                            </div>
                        </div>


                    </div>
                }}
            />
        </div>
    }
}