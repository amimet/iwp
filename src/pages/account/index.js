import React from 'react'
import * as antd from 'antd'
import withConnector from 'core/libs/withConnector'

@withConnector
export default class Account extends React.Component {
    render() {
        const { username, fullName, email, avatar, sub } = this.props.app.account_data
        console.log(this.props.app.account_data)
        return (
            <div>
                <div className={window.classToStyle('account_header')}>
                    <img src={avatar} />
                    <div style={{ margin: "0 15px" }}>
                        <h1>@{username}</h1>
                        <span>#{sub}</span>
                    </div>
                </div>
            </div>
        )
    }
}