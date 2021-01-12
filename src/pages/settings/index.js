import React from 'react'
import * as antd from 'antd'
import { connect } from 'umi'
import { ButtonMenu } from 'components'

let settingList = [
    {
        id: "locale",
        title: "Language",
        icon: "TranslationOutlined"
    }
]

function WithAccountData(childrenClass) {
    childrenClass.prototype.accountData = function () {
        return this.props.app.accountData
    }

    return connect(({ app }) => ({ app }))(childrenClass)
}

@WithAccountData
export default class Settings extends React.Component {
    state = {
        openSetting: null
    }

    setting = {
        open: (id) => {
            this.setState({ openSetting: id })
        },
        close: () => {
            this.setState({ openSetting: null })
        }
    }

    renderAccountCard() {
        return (
            <antd.Card>
                <antd.Avatar />
                <h1>{this.props.app.session.username}</h1>
            </antd.Card>
        )
    }

    render() {
        return (
            <div>
                <antd.Drawer placement="bottom" onClose={this.setting.close()} visible={this.state.openSetting} >

                </antd.Drawer>
                {this.renderAccountCard()}
                <div style={{ marginTop: "15px" }} >
                    <ButtonMenu
                        menus={settingList}
                        onClick={(id) => {
                            this.setting.open(id)
                        }}
                    />
                </div>
            </div>
        )
    }
}