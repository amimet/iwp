import React from 'react'
import * as Icons from 'components/Icons'
import { Layout, Menu } from 'antd'
import { history } from 'umi'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import { Settings } from 'components'
import { Controller, withConnector, DJail } from 'core/libs'

import { objectToArrayMap } from '@corenode/utils'
import { logo } from 'config'

import defaultSidebarKeys from 'schemas/defaultSidebar.json'
import sidebarItems from 'schemas/sidebar.json'
import bottomSidebarItems from 'schemas/bottomSidebar.json'

import AccountComponent from './components/account'

const { Sider } = Layout

const onClickHandlers = {
    "settings": (event) => {
        Settings.open()
    }
}

const createIconRender = (icon, props) => {
    if (typeof Icons[icon] !== "undefined") {
        return React.createElement(Icons[icon], props)
    }

    return null
}

const allItemsMap = [...sidebarItems, ...bottomSidebarItems]
    .map((item, index) => {
        item.key = index.toString()
        return item
    })

const getAllItems = () => {
    let items = {}

    allItemsMap.forEach((item) => {
        items[item.id] = {
            ...item,
            id: item.id,
            key: item.key,
            content: <>{createIconRender(item.icon)} {item.title}</>
        }
    })

    return items
}

const allItems = getAllItems()

class SidebarEdit extends React.Component {
    state = {
        items: [],
        activeObjects: [],
        disabledObjects: [],
    }

    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)

        return result
    }

    onDragEnd = (result) => {
        const item = allItems[result.draggableId] ?? {}

        if (item.locked) {
            return
        }

        if (!result.destination) {
            return
        }

        const items = this.reorder(
            this.state.items,
            result.source.index,
            result.destination.index,
        )

        this.setState({ items })
    }

    componentDidMount() {
        let active = []
        let disabled = []

        const storagedKeys = global.sidebarController.get()

        storagedKeys.forEach((key) => {
            let item = allItems[key]

            if (item.parent)
                return
            if (item.locked)
                return

            active.push(item)
        })

        allItemsMap.forEach((item) => {
            if (!active.includes(item.id)) {
                disabled.push(item.id)
            }
        })

        this.setState({ items: active })
    }

    render() {
        const grid = 6

        const getItemStyle = (isDragging, draggableStyle) => ({
            userSelect: 'none',
            padding: grid * 2,
            margin: `0 0 ${grid}px 0`,
            borderRadius: "6px",
            transition: "150ms all ease-in-out",
            width: "100%",

            background: isDragging ? 'rgba(145, 145, 145, 0.5)' : 'rgba(145, 145, 145, 0.9)',
            ...draggableStyle,
        })

        const getListStyle = (isDraggingOver) => ({
            background: isDraggingOver ? 'rgba(145, 145, 145, 0.5)' : 'transparent',
            transition: "150ms all ease-in-out",

            padding: grid,
            width: "100%",
        })

        return <div>
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                    {(droppableProvided, droppableSnapshot) => (
                        <div
                            ref={droppableProvided.innerRef}
                            style={getListStyle(droppableSnapshot.isDraggingOver)}
                        >
                            {this.state.items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(draggableProvided, draggableSnapshot) => (
                                        <div
                                            ref={draggableProvided.innerRef}
                                            {...draggableProvided.draggableProps}
                                            {...draggableProvided.dragHandleProps}
                                            style={getItemStyle(
                                                draggableSnapshot.isDragging,
                                                draggableProvided.draggableProps.style,
                                            )}
                                        >
                                            {item.content}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {droppableProvided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    }
}

@withConnector
export default class Sidebar extends React.Component {
    userData = this.props.app.account_data

    sidebarHelpers = new Controller({ id: "sidebar", locked: true })

    sidebarComponentsMap = {
        account: React.createElement(AccountComponent, { username: this.userData.username, avatar: this.userData.avatar })
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

    handleClick = (e) => {
        console.log(e)
        if (typeof e.key === "undefined") {
            global.applicationEvents.emit("invalidSidebarKey", e)
            return false
        }

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
            global.applicationEvents.emit("cleanAll")
        }

        this.setState({ editMode: to })
    }

    onMouseEnter = (event) => {
        this.setState({ isHover: true })
    }

    handleMouseLeave = (event) => {
        this.setState({ isHover: false })
    }

    setHelpers() {
        this.sidebarHelpers.add("toogleEdit", (to) => {
            this.toogleEditMode(to)
        }, { lock: true })

        this.sidebarHelpers.add("toogleCollapse", (to) => {
            this.setState({ collapsed: (to ?? !this.state.collapsed) })
        }, { lock: true })
    }

    componentDidMount() {
        const sidebarController = global.sidebarController
        this.setHelpers()

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
        let scopeKeys = [...sidebarController.get()]

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
                if (this.sidebarComponentsMap[item.component]) {
                    return this.sidebarComponentsMap[item.component]
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
                    onClick={this.handleClick}
                >
                    {this.renderMenuItems(item.value)}
                </Menu>
            </div>
        })
    }

    render() {
        if (settingsController.is("collapseOnLooseFocus", true) && !this.state.editMode) {
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

                <div className={window.classToStyle('sidebar_header')}>
                    <div className={window.classToStyle('sidebar_header_logo')}>
                        <img src={logo?.alt ?? null} />
                    </div>
                </div>

                {
                    this.state.editMode
                        ? <div>
                            <div style={{ width: "" }} onClick={() => { this.toogleEditMode() }}>
                                {createIconRender("Save")} Done
                             </div>
                            <SidebarEdit />
                        </div>
                        : null
                }

                <div className={window.classToStyle('sidebar_menu_wrapper')}>
                    {this.renderMenus(this.proccessMenus(this.state.menus))}
                </div>
            </Sider>
        )
    }
}