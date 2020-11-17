import React from 'react'
import * as antd from 'antd'
import { history, connect } from 'umi'
import { FormattedMessage, FormattedNumber } from 'react-intl'

@connect(({ app }) => ({ app }))
export default class Index extends React.Component {
    state = {
        
    }

    openMenu(id) {
        try {
            history.push(`/${id}`)
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        const session = this.props.app.session
        return (
            <div>
                <h1><FormattedMessage id="welcome_index" values={{ user: session.fullName ?? session.username ?? "Default" }} defaultMessage={"Welcome! {user}"} /></h1>
            </div>
        )
    }
}