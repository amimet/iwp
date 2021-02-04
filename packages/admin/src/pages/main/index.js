import React from 'react'
import * as antd from 'antd'
import { history, connect } from 'umi'
import { FormattedMessage, FormattedNumber } from 'react-intl'

@connect(({ app }) => ({ app }))
export default class Index extends React.Component {
    render() {
        const session = this.props.app.session
        return (
            <div>
                <h1 style={{ fontWeight: 700, fontSize: '31px' }}>
                    <antd.Avatar style={{ marginRight: "17px" }} size="large" shape="square" src="https://www.flaticon.com/svg/static/icons/svg/149/149071.svg" />
                    <FormattedMessage id="welcome_index" values={{ user: session.fullName ?? session.username ?? "Default" }} defaultMessage={"Welcome! {user}"} />
                </h1>
            </div>
        )
    }
}