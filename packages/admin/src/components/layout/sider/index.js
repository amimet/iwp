import React from 'react'
import * as Icons from 'components/Icons'
import { Layout, Menu } from 'antd'
import * as antd from 'antd'
import { history } from 'umi'

import { Settings } from 'components'
import { Controller, withConnector, DJail } from 'core/libs'

import { objectToArrayMap } from '@corenode/utils'
import { logo } from 'config'

import defaultSidebarKeys from 'schemas/defaultSidebar.json'
import sidebarItems from 'schemas/sidebar.json'
import bottomSidebarItems from 'schemas/bottomSidebar.json'

const { Sider } = Layout

const onClickHandlers = {
    "settings": (event) => {
        Settings.open()
    }
}

const SidebarStorageControllerKey = "app_sidebar"
const SidebarStorageController = new DJail({ name: SidebarStorageControllerKey, voidMutation: true, type: "array" })

@withConnector
class SidebarEdit extends React.Component {
    allItems = [...sidebarItems, ...bottomSidebarItems]
        .map((item, index) => {
            if (item.locked) {
                item.disabled = true
            }

            item.key = index.toString()
            return item
        })
        .filter((item) => !item.disabled)

    state = {
        targetKeys: [],
        selectedKeys: [],
    }

    handleUpdate = () => {
        const targetKeys = this.state.targetKeys

        targetKeys.forEach((key) => {
            const item = this.allItems[key]
            if (typeof item !== "undefined") {
                SidebarStorageController.set(item.id, item.id)
            }
        })
    }

    handleChange = (nextTargetKeys, direction, moveKeys) => {
        this.setState({ targetKeys: nextTargetKeys })
        this.handleUpdate()
    }

    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] })
    }

    componentDidMount() {
        let targetKeys = [...this.state.targetKeys]
        const storagedKeys = SidebarStorageController.get()

        this.allItems.forEach((item) => {
            const key = storagedKeys[item.id]

            if (typeof key === "undefined") {
                if (defaultSidebarKeys.includes(item.id)) {
                    targetKeys.push(item.key)
                }
            }

        })

        this.setState({ targetKeys })
    }

    render() {
        const { targetKeys, selectedKeys } = this.state
        return (
            <>
                <antd.Transfer
                    dataSource={this.allItems}
                    titles={['Disabled', 'Enabled']}
                    targetKeys={targetKeys}
                    selectedKeys={selectedKeys}
                    onChange={this.handleChange}
                    onSelectChange={this.handleSelectChange}
                    render={item => item.title}
                    oneWay
                />
            </>
        )
    }
}

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
        isHover: false,
        collapsed: this.props.collapsed ?? settingsController.get("collapseOnLooseFocus") ?? false,
        editMode: false,
        loading: true,
        pathResolve: {},
        menus: {},
        theme: this.props.app.activeTheme ?? "light"
    }

    handleClick(e) {
        if (typeof onClickHandlers[e.key] === "function") {
            return onClickHandlers[e.key](e)
        }
        if (typeof this.state.pathResolve[e.key] !== "undefined") {
            return history.push(`/${this.state.pathResolve[e.key]}`)
        }
        return history.push(`/${e.key}`)
    }

    toogleEditMode(to) {
        if (typeof to === "undefined") {
            to = !this.state.editMode
        }

        if (to) {
            return window.controllers.drawer.open(SidebarEdit, { props: { closeIcon: <Icons.Save />, placement: "left", onClose: () => this.toogleEditMode(false), width: "50%" } })
        } else {
            return window.controllers.drawer.close()
        }
    }

    onMouseEnter = (event) => {
        this.setState({ isHover: true })
    }

    handleMouseLeave = (event) => {
        this.setState({ isHover: false })
    }

    setController() {
        this.sidebarController.add("toogleEdit", (to) => {
            this.toogleEditMode(to)
        }, { lock: true })

        this.sidebarController.add("toogleCollapse", (to) => {
            this.setState({ collapsed: (to ?? !this.state.collapsed) })
        }, { lock: true })

    }

    componentDidMount() {
        this.setController()

        let objects = {}
        let items = [
            ...sidebarItems.map((obj) => {
                obj.position = "top"
                return obj
            }),
            ...bottomSidebarItems.map((obj) => {
                obj.position = "bottom"
                return obj
            })
        ]

        let menus = {}
        let scopeKeys = [...defaultSidebarKeys]

        items.forEach((item) => {
            objects[item.id] = item

            try {
                let valid = true
                let obj = {
                    id: item.id,
                    title: item.title ?? item.id,
                    position: item.position ?? "top",
                    component: item.component
                }

                // object validation
                if (!scopeKeys.includes(item.id) && !item.locked) {
                    valid = false
                }

                if (typeof (item.requireState) === "object") {
                    const { key, value } = item.requireState
                    window.dispatcher({
                        type: "isStateKey",
                        payload: { key, value },
                        callback: (result) => {
                            if (!result) {
                                valid = false
                            }
                        }
                    })
                }

                // end validation
                if (!valid) {
                    return false
                }

                // handle props
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

        this.setState({ menus: menus, loading: false })
    }

    renderMenuItems(items) {
        const handleRenderIcon = (icon) => {
            if (typeof (icon) !== "object") {
                return null
            }
            return icon
        }

        return items.map((item) => {
            if (typeof (item.component) !== "undefined") {
                if (this.SidebarItemComponentMap[item.component]) {
                    return this.SidebarItemComponentMap[item.component]
                }
            }
            if (Array.isArray(item.childrens)) {
                return <Menu.SubMenu
                    key={item.id}
                    icon={handleRenderIcon(item.icon)}
                    title={<span>{item.title}</span>}
                    {...item.props}
                >
                    {this.renderMenuItems(item.childrens)}
                </Menu.SubMenu>
            }
            return <Menu.Item key={item.id} icon={handleRenderIcon(item.icon)} {...item.props}>{item.title ?? item.id}</Menu.Item>
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


        if (typeof (scope) !== "undefined") {
            return menus[scope]
        }

        return menus
    }

    renderMenus(menus) {
        return objectToArrayMap(menus).map((item) => {
            return <div key={item.key} className={window.classToStyle(`sidebarMenu_${item.key}`)}>
                <Menu
                    selectable={item.key === "bottom" ? false : true}
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
        if (settingsController.is("collapseOnLooseFocus", true)) {
            while (this.state.isHover && this.state.collapsed) {
                window.controllers.sidebar.toogleCollapse(false)
                break
            }
            while (!this.state.isHover && !this.state.collapsed) {
                const delay = 500
                setTimeout(() => {
                    window.controllers.sidebar.toogleCollapse(true)
                }, delay)

                break
            }
        } else {
            if (this.state.collapsed) {
                window.controllers.sidebar.toogleCollapse(false)
            }
        }

        if (this.state.loading) return null

        return (
            <Sider
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                theme={this.state.theme}
                collapsed={this.state.collapsed}
                onCollapse={() => this.props.onCollapse()}
                className={window.classToStyle(this.state.editMode ? 'sidebar_sider_edit' : 'sidebar_sider')}
            >
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