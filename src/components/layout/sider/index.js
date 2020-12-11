import React from 'react'
import * as Icons from 'components/Icons'
import { Layout, Menu } from 'antd'
import withConnector from 'core/libs/withConnector'
import * as antd from 'antd'
import { history } from 'umi'
import { __legacy__objectToArray } from '@ragestudio/nodecore-utils'
import Items from 'globals/sidebar.json'

const { Sider } = Layout
const menuPositions = {
    top: "topMenus",
    bottom: "bottomMenus"
} 
@withConnector
export default class Sidebar extends React.Component {

    SidebarItemComponentMap = {
        account: <Menu.Item key="account">
            <antd.Avatar src={this.props.app.account_data["avatar"]} /> @{this.props.app.account_data["username"] ?? "account"}
        </Menu.Item>
    }

    state = {
        done: false,
        pathResolve: {},
        menus: {},
        theme: this.props.app.activeTheme ?? "light"
    }

    handleClick(e) {
        if (typeof (this.state.pathResolve[e.key]) !== "undefined") {
            return history.push(`${this.state.pathResolve[e.key]}`)
        }
        return history.push(`${e.key}`)
    }

    componentDidMount() {
        if (Items) {
            let menus = this.state.menus ?? {}
            let parents = {}

            Items.forEach(async (item) => {
                try {
                    let toState = "top" // by default stash items to top menu
                    let obj = {
                        id: item.id,
                        title: item.title ?? item.id,
                        ...item
                    }
                    if (typeof (item.requireState) !== "undefined") {
                        if (!window.requiresState(item.requireState)) {
                            return false
                        }
                    }
                    if (typeof(item.position) !== "undefined" && typeof(item.position) == "string" && menuPositions[item.position] ) {
                        toState = item.position
                    }

                    if (!Array.isArray(menus[toState])) {
                        menus[toState] = []
                    }
                    if (typeof (item.icon) !== "undefined" && typeof (Icons[item.icon]) !== "undefined") {
                        obj.icon = React.createElement(Icons[item.icon])
                    }
                    if (typeof (item.path) !== "undefined") {
                        let resolvers = this.state.pathResolve ?? {}
                        resolvers[item.id] = item.path
                        this.setState({ pathResolve: resolvers })
                    }
                    if (typeof (item.sub) !== "undefined" && item.sub) {
                        return parents[item.id] = {
                            id: item.id,
                            childrens: [],
                            ...obj
                        }
                    }
                    if (typeof (item.parent) !== "undefined" && parents[item.parent]) {
                        parents[item.parent].childrens.push(obj)
                        return menus[toState].push(parents[item.parent])
                    }
                    return menus[toState].push(obj)
                } catch (error) {
                    return console.log(error)
                }
            })

            this.setState({ menus, done: true })
        }
    }

    renderMenuItems(list) {
        if (!Array.isArray(list)) {
            console.log(`Invalid render menus, list is not an array`)
            return false
        }

        const handleRenderIcon = (icon) => {
            if (typeof (icon) !== "object") {
                return null
            }
            return icon
        }

        return list.map((item) => {
            if (typeof (item.component) !== "undefined" && item.component != null) {
                if (this.SidebarItemComponentMap[item.component]) {
                    return this.SidebarItemComponentMap[item.component]
                }
            }
            if (item.sub) {
                return <Menu.SubMenu
                    // onTitleClick={(e) => {
                    //     if (item.path) {
                    //         this.handleClick(item.path)
                    //     }
                    // }}
                    key={item.id}
                    icon={handleRenderIcon(item.icon)}
                    title={item.title} >
                    {this.renderMenuItems(item.childrens)}
                </Menu.SubMenu>
            }
            return <Menu.Item key={item.id} icon={handleRenderIcon(item.icon)} ><span>{item.title ?? item.id}</span></Menu.Item>
        })
    }

    returnMenu = {
        top: () => {
            return <Menu
                onClick={(e) => this.handleClick(e)}
                theme={this.state.theme}
                mode="inline"
            >
                {this.renderMenuItems(this.state.menus["top"])}
            </Menu>
        },
        bottom: () => {
            return <Menu
                onClick={(e) => this.handleClick(e)}
                theme={this.state.theme}
                mode="inline"
            >
                {this.renderMenuItems(this.state.menus["bottom"])}
            </Menu>
        }
    }

    render() {
        if (!this.state.done) {
            return null
        }
        return (
            <Sider
                theme={this.state.theme}
                collapsible
                collapsed={this.props.collapsed}
                onCollapse={() => this.props.onCollapse()}
            >
                <div>
                    {this.returnMenu.top()}
                </div>
                <div style={{ position: "absolute", bottom: 0, marginBottom: "48px" }}>
                    {this.returnMenu.bottom()}
                </div>
            </Sider>
        )
    }
}