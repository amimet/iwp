import React from "react"
import * as antd from "antd"

import { ActionsBar, UserSelector } from "components"
import { Icons } from "components/icons"

import "./index.less"

class UpdateUserRoles extends React.Component {
    state = {
        users: null,
        roles: null,
    }

    api = window.app.request

    componentDidMount = async () => {
        await this.fetchRoles()
    }

    fetchRoles = async () => {
        const result = await this.api.get.roles().catch((err) => {
            antd.message.error(err)
            console.error(err)
            return false
        })

        if (result) {
            this.setState({ roles: result })
        }
    }

    fetchUsersData = async (users) => {
        const result = await this.api.get.users(undefined, { _id: users }).catch((err) => {
            antd.message.error(err)
            console.error(err)
            return false
        })

        if (result) {
            this.setState({
                users: result.map((data) => {
                    return {
                        _id: data._id,
                        username: data.username,
                        roles: data.roles,
                    }
                })
            })
        }
    }

    handleSelectUser = async (users) => {
        this.fetchUsersData(users)
    }

    handleRoleChange = (userId, role, to) => {
        let updatedUsers = this.state.users.map((user) => {
            if (user._id === userId) {
                if (to == true) {
                    user.roles.push(role)
                } else {
                    user.roles = user.roles.filter((r) => r !== role)
                }
            }

            return user
        })

        this.setState({ users: updatedUsers })
    }

    handleSubmit = async () => {
        const update = this.state.users.map((data) => {
            return {
                _id: data._id,
                roles: data.roles,
            }
        })

        const result = await this.api.post.updateUserRoles({ update }).catch((err) => {
            antd.message.error(err)
            console.error(err)
            return false
        })

        if (result) {
            this.props.handleDone(result)
            if (typeof this.props.close === "function") {
                this.props.close()
            }
        }
    }

    renderItem = (item) => {
        return <div className="grantRoles_user">
            <h2>
                <Icons.User /> {item.username}
            </h2>
            <div className="roles">
                {this.state.roles.map((role) => {
                    return <antd.Checkbox
                        key={role.name}
                        checked={item.roles.includes(role.name)}
                        onChange={(to) => this.handleRoleChange(item._id, role.name, to.target.checked)}
                    >
                        {role.name}
                    </antd.Checkbox>
                })}
            </div>
        </div>
    }

    render() {
        const { users } = this.state

        if (!users) {
            return <UserSelector handleDone={this.handleSelectUser} />
        }

        return <div>
            {users.map((data) => {
                return this.renderItem(data)
            })}

            <ActionsBar>
                <div>
                    <antd.Button icon={<Icons.Save />} onClick={() => this.handleSubmit()}>
                        Submit
                    </antd.Button>
                </div>
            </ActionsBar>
        </div>
    }
}

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

    updateUserRoles = async () => {
        window.app.DrawerController.open("grant-roles-to-user", UpdateUserRoles)
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
                <antd.Button onClick={() => this.updateUserRoles()} icon={<Icons.User />} >Update users</antd.Button>
            </ActionsBar>

            {!this.state.data ?
                <antd.Skeleton active /> :
                <antd.List
                    dataSource={this.state.data}
                    renderItem={(item) => this.renderItem(item)}
                />
            }
        </div>
    }
}