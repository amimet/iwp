import React from 'react'
import * as antd from 'antd'
import { withConnector } from 'core/libs'
import { ButtonMenu } from 'components'

let settingList = [
    {
        id: "locale",
        title: "Language",
        icon: "TranslationOutlined"
    },
    {
        id: "sidebar",
        title: "Sidebar",
        icon: "Columns"
    },
    {
        id: "modules",
        title: "Modules",
        icon: "Package"
    }
]
export default class Settings extends React.Component {
    setting = {
        open: (id) => {
            this.setState({ openSetting: id })
        },
        close: () => {
            this.setState({ openSetting: null })
        }
    }

    render() {
        return (
            <div style={{ marginTop: "15px" }} >
                <ButtonMenu
                    menus={settingList}
                    onClick={(id) => this.setting.open(id)}
                />
            </div>
        )
    }
}