import React from 'react'
import * as antd from 'antd'
import * as Icons from 'react-feather'
import { history, connect } from 'umi'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { ButtonMenu } from 'components'

const mapInputSecodary = [
    {
        id: "profile",
        title: "Profile",
        icon: "User"
    },
    {
        id: "settings",
        title: "Settings",
        icon: "Settings",
        iconStyle: {
            color: "#FFBA49"
        }
    }
]

const mapInput = [
    {
        id: "workload",
        title: "Workload",
        icon: "Truck",
        iconStyle: {
            color: "#9254de"
        }
    },
    {
        id: "help",
        title: "Help & Assitence",
        icon: "LifeBuoy",
        iconStyle: {
            color: "#ff7a45"
        }
    },
    {
        id: "data",
        title: "My Data",
        icon: "FileText",
        iconStyle: {
            color: "#73d13d"
        }
    },
    {
        id: "statistics",
        title: "Statistics",
        icon: "TrendingUp",
        iconStyle: {
            color: "#1890ff"
        }
    },

]
@connect(({ app }) => ({ app }))
export default class Index extends React.Component {
    state = {
        menus: mapInput, // remains set filter query
        secondMenu: mapInputSecodary
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
                <ButtonMenu
                    onClick={(id) => { this.openMenu(id) }}
                    menus={mapInput}
                    secondaryMenus={mapInputSecodary}
                />
            </div>
        )
    }
}