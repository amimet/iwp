import React from 'react'
import * as Icons from 'components/Icons'
import { Layout, Menu } from 'antd'
import withConnector from 'core/libs/withConnector'
import * as antd from 'antd'
import { history } from 'umi'

import Items from 'globals/sidebar.json'

const { Sider } = Layout

@withConnector
export default class Sidebar extends React.Component {

    state = {
        pathResolve: {},
        menus: [],
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
            let menus = this.state.menus ?? []
            let parents = {}

            Items.forEach(item => {
                try {
                    let obj = {
                        id: item.id,
                        title: item.title ?? item.id,
                        ...item
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
                        return menus.push(parents[item.parent])
                    }
                    return menus.push(obj)
                } catch (error) {
                    return console.log(error)
                }
            })
            this.setState({ menus })
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
            return <Menu.Item key={item.id} icon={handleRenderIcon(item.icon)} >{item.title ?? item.id}</Menu.Item>
        })
    }

    renderAuthedMenu() {
        if (this.props.app.session_valid) {
            console.log(this.props.app.account_data)
            return(
                <Menu>
                    <Menu.Item>
                       <antd.Avatar src={this.props.app.account_data["avatar"]} /> @{this.props.app.session.username?? "account"}
                    </Menu.Item>
                </Menu>
            )
        }
    }

    render() {
        return (
            <Sider theme={this.state.theme} collapsible collapsed={this.props.collapsed} onCollapse={() => this.props.onCollapse()}>
                <div>
                    <Menu onClick={(e) => this.handleClick(e)} theme={this.state.theme} defaultSelectedKeys={['1']} mode="inline">
                        {this.renderMenuItems(this.state.menus)}
                    </Menu>
                </div>
                <div>
                    { this.renderAuthedMenu() }
                </div>
            </Sider>
        )
    }
}