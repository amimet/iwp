import React from 'react'
import * as Icons from 'components/Icons'
import { Layout, Menu } from 'antd'
import * as antd from 'antd'
import { history } from 'umi'

import { Controller, withConnector } from 'core/libs'

import { objectToArrayMap } from '@nodecorejs/utils'
import { logo } from 'config'

import DefaultItemsKeys from 'schemas/defaultSidebar.json'
import Items from 'schemas/sidebar.json'
import BottomItems from 'schemas/bottomSidebar.json'

const { Sider } = Layout

@withConnector
export default class Sidebar extends React.Component {
    sidebarController = new Controller({ id: "sidebar", locked: true })

    SidebarItemComponentMap = {
        account: <Menu.Item key="account">
            <antd.Avatar style={{ marginRight: "8px" }} src={this.props.app.account_data["avatar"]} />
            <span>
                {!this.props.collapsed && `@${this.props.app.account_data["username"]}`}
            </span>
        </Menu.Item>
    }

    state = {
        editMode: false,
        done: false,
        pathResolve: {},
        menus: {},
        theme: this.props.app.activeTheme ?? "light"
    }

    handleClick(e) {
        if (typeof (this.state.pathResolve[e.key]) !== "undefined") {
            return history.push(`/${this.state.pathResolve[e.key]}`)
        }
        return history.push(`/${e.key}`)
    }

    toogleEditMode(to) {
        return this.setState({ editMode: to ?? !this.state.editMode })
    }

    componentDidMount() {
        this.sidebarController.add("toogleEdit", (to) => {
            return this.toogleEditMode(to)
        }, { lock: true })

        if (Items) {
            const custom = this.props.app.sidebar

            let scope = []
            let menus = this.state.menus ?? {}
            const itemsmix = [...BottomItems, ...Items]

            let objs = {}

            if (Array.isArray(custom)) {
                custom.forEach((key) => {
                    scope.push(key)
                })
            } else {
                scope = DefaultItemsKeys
            }

            BottomItems.forEach((entry) => {
                scope.push(entry.id) // avoid excluding bottom items
            })

            itemsmix.forEach((entry) => {
                objs[entry.id] = entry
            })

            scope.forEach(async (key) => {
                const item = objs[key]

                try {
                    let obj = {
                        id: item.id,
                        title: item.title ?? item.id,
                        position: item.position ?? "top",
                        component: item.component
                    }
                    if (typeof (item.requireState) !== "undefined") {
                        if (!window.requiresState(item.requireState)) {
                            return false
                        }
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
                        return menus[item.id] = {
                            childrens: [],
                            ...obj
                        }
                    }
                    if (typeof (item.parent) !== "undefined" && menus[item.parent]) {
                        return menus[item.parent].childrens.push(obj)
                    }

                    return menus[item.id] = obj
                } catch (error) {
                    return console.log(error)
                }
            })
            this.setState({ menus, done: true })
        }
    }

    renderMenuItems(items) {        
        const handleRenderIcon = (icon) => {
            if (typeof (icon) !== "object") {
                return null
            }
            return icon
        }
        
        return items.map((item) => {
            if (item.component != null) {
                if (this.SidebarItemComponentMap[item.component]) {
                    return this.SidebarItemComponentMap[item.component]
                }
            }
            if (Array.isArray(item.childrens)) {
                return <Menu.SubMenu
                    
                    key={item.id}
                    icon={handleRenderIcon(item.icon)}
                    title={<span>{item.title}</span>}
                >
                    {this.renderMenuItems(item.childrens)}
                </Menu.SubMenu>
            }
            return <Menu.Item key={item.id} icon={handleRenderIcon(item.icon)} >{item.title ?? item.id}</Menu.Item>
        })
    }

    proccessMenus(data, scope) {
        let menus = {}

        objectToArrayMap(data).forEach((item) => {
            const position = item.value.position ?? "top"
            if (!menus[position]) {
                menus[position] = []
            }

            menus[position].push(item.value)
        })


        if (typeof(scope) !== "undefined") {
            return menus[scope]
        }

        return menus
    }
    
    renderMenus(menus) {
        return objectToArrayMap(menus).map((item) => {
            return <div key={item.key} className={window.classToStyle(`sidebarMenu_${item.key}`)}>
                <Menu
                    mode="inline"
                    theme={this.state.theme}
                    onClick={(e) => this.handleClick(e)}
                >
                    {this.renderMenuItems(item.value)}
                </Menu>
            </div>
        })
    }

    render() {
        if (!this.state.done) return null

        return (
            <Sider
                theme={this.state.theme}
                collapsible
                collapsed={this.props.collapsed}
                onCollapse={() => this.props.onCollapse()}
                className={window.classToStyle(this.state.editMode ? 'sidebar_sider_edit' : 'sidebar_sider')}
            >
                <antd.Drawer
                    closeIcon={<Icons.Save />}
                    placement="left"
                    visible={this.state.editMode}
                    onClose={() => this.toogleEditMode(false)}
                    style={{ display: "flex" }}
                >
                    <div className={window.classToStyle('sidebar_menu_wrapper_edit')}>
                        {this.renderMenuItems(this.proccessMenus(this.state.menus, "top"))}
                    </div>
                </antd.Drawer>
                {this.state.editMode ? null :
                    <div className={window.classToStyle('sidebar_header')}>
                        <div className={window.classToStyle('sidebar_header_logo')}>
                            <img src={logo?.alt ?? null} />
                        </div>
                    </div>
                }
                <div className={window.classToStyle('sidebar_menu_wrapper')}>
                    {this.renderMenus(this.proccessMenus(this.state.menus))}
                </div>
            </Sider>
        )
    }
}