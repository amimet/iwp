import React from 'react'
import * as antd from 'antd'

export default class Users extends React.Component {
    state = {
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
                this.setState({ list: res.data })
            }
        })
    }

    renderRoles(roles) {
        return roles.map((role) => {
            return <antd.Tag key={role} > {role} </antd.Tag>
        })
    }

    render() {
        return <antd.List
            dataSource={this.state.list}
            renderItem={(item) => {
                console.log(item)
                return <div key={item._id} className={window.classToStyle("user_card")}>
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
    }
}