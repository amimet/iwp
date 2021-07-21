import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@corenode/utils'
import { LoadingSpinner } from 'components'

export default class Users extends React.Component {
    state = {
        users: {},
        list: null,
        openUser: null,
        selectedUsers: [],
    }

    componentDidMount = async () => {
        // TODO: fetch users from api
    }

    handleDataResponse(res) {
        let updated = {}

        objectToArrayMap(res).forEach((user) => {
            updated[user.value.username] = user.value
        })
        this.setState({ users: updated, list: res })
    }

    selectUser(user) {

    }

    openUserDrawer(user) {
        if (typeof (user) == "string") {
            this.setState({ openUser: user })
        } else {
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
        console.log(userData)

        if (typeof (userData) !== "undefined") {
            return <div className={window.classToStyle("user_drawer_wrapper")}>

                <antd.Avatar style={{ margin: "auto" }} shape="square" src={userData.avatar} />

                <div className={window.classToStyle("user_card_title")}>
                    <div style={{ width: "100%", height: "33px" }}>
                        <div style={{ float: "left" }}>
                            <h1>{userData.fullName ? userData.fullName : null}</h1>
                        </div>
                        <div style={{ float: "right" }}>
                            {this.renderRoles(userData.roles)}
                        </div>
                    </div>
                    <div>
                        <h3>@{userData.username}#{userData._id}</h3>
                    </div>
                </div>
            </div>
        }
    }

    render() {
        if (!this.state.list) return <LoadingSpinner />

        return <div>
            <antd.Drawer
                onClose={() => { this.closeUserDrawer() }}
                visible={this.state.openUser}
                width="60%"
            >
                {this.renderUserDrawer()}
            </antd.Drawer>
            <div className={window.classToStyle("users_list_wrapper")} >
                <antd.List
                    dataSource={this.state.list}
                    renderItem={(item) => {
                        return <div onDoubleClick={() => this.openUserDrawer(item.username)} onClick={() => this.selectUser(item.username)} key={item._id} className={window.classToStyle("user_card")}>
                            <div>
                                <antd.Avatar shape="square" src={item.avatar} />
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
        </div>
    }
}