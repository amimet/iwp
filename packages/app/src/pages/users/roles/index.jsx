import React from "react"
import * as antd from "antd"

import { ActionsBar, Skeleton } from "components"
import { Icons } from "components/Icons"

import "./index.less"

export default class Roles extends React.Component {
    state = {
        data: null,
    }

    api = window.app.request

    componentDidMount = async () => {
        await this.fetchRoles()
    }

    fetchRoles = async () => {
        const roles = await this.api.get.roles().catch((err) => {
            antd.message.error(err)
            console.error(err)
            return false
        })

        if (roles) {
            this.setState({ data: roles })
        }
    }

    handleRoleDelete = (role) => {
        antd.Modal.confirm({
            title: "Are you sure you want to delete this role?",
            content: `Role: ${role}`,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                const result = await this.api.delete.role({ name: role }).catch((err) => {
                    antd.message.error(err)
                    console.error(err)
                    return false
                })

                if (result) {
                    await this.fetchRoles()
                }
            }
        })
    }

    handleCreateNew = () => {
        let inputRoleRef = React.createRef()
        let inputDescriptionRef = React.createRef()

        antd.Modal.confirm({
            title: "Create a new role",
            content: <div className="new_role_form">
                <div>
                    <antd.Input ref={inputRoleRef} placeholder="Role name" />
                </div>
                <div>
                    <antd.Input ref={inputDescriptionRef} placeholder="Description" />
                </div>
            </div>,
            onOk: () => {
                return new Promise(async (resolve, reject) => {
                    const roleValue = inputRoleRef.current.state.value
                    const roleDescription = inputDescriptionRef.current.state.value

                    const result = await this.api.post.role({
                        name: roleValue,
                        description: roleDescription,
                    }).catch((err) => {
                        antd.message.error(err)
                        console.error(err)
                        reject()
                        return false
                    })

                    if (result) {
                        this.fetchRoles()
                        return resolve()
                    }
                })
            }
        })
    }

    renderItem = (item) => {
        return <div key={item._id}>
            <antd.List.Item
                actions={[<a onClick={() => this.handleRoleDelete(item.name)} key="delete">Delete</a>]}
            >
                <antd.List.Item.Meta
                    avatar={<Icons.Box />}
                    title={item.name}
                    description={item.description}
                />
            </antd.List.Item>
        </div>
    }

    render() {
        return <div className="users_list_wrapper" >
            <ActionsBar mode="float" spaced>
                <antd.Button onClick={() => this.handleCreateNew()} icon={<Icons.PlusOutlined />} type="primary">New</antd.Button>
            </ActionsBar>

            {!this.state.data ?
                <Skeleton /> :
                <antd.List
                    dataSource={this.state.data}
                    renderItem={(item) => this.renderItem(item)}
                />
            }
        </div>
    }
}