import React from 'react'

export default class Account extends React.Component {
    render() {
        const username = "bruh"
        const avatar = ""
        const sub = ""
        
        // const { username, fullName, email, avatar, sub } = this.props.app.account_data
        // console.log(this.props.app.account_data)
        return (
            <div>
                <div className="app_account_header">
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