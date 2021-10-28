import React from 'react'
import * as antd from 'antd'
import { Icons } from 'components/icons'

import { LoadingSpinner, FormGenerator } from 'components'

import { Drawer, Button, Select } from 'antd'

const api = window.app.apiBridge

class ModifyRole extends React.Component {
    handleSubmit(context) {
        console.log(context)
    }

    render() {
        return <FormGenerator
            name="roles_createnew"
            renderLoadingIcon
            onFinish={(context) => this.handleSubmit(context)}
            items={[
                {
                    id: "title",
                    title: "Role name",
                    element: {
                        component: "Input"
                    },
                    item: {
                        hasFeedback: true,
                        rules: [
                            {
                                required: true,
                                message: 'Input an name for role',
                            },
                        ],
                    }
                },
                {
                    id: "permissions",
                    title: "Permissions",
                    element: {
                        component: "Select",
                        props: {
                            mode: "multiple",
                            allowClear: true,
                        }
                    },
                    item: {
                        hasFeedback: true,
                        rules: [
                            {
                                required: true,
                                message: 'Input an name for Device',
                            },
                        ],
                    }
                },
            ]}
        />
    }
}

export default class Roles extends React.Component {
    state = {
        data: null,
    }

    componentDidMount = async () => {
        await api.get
            .roles()
            .then((data) => {
                this.setState({ data })
            })
            .catch((err) => {
                this.setState({ error: err.message })
            })
    }

    openRoleCreator = () => {
        window.controllers["drawer"].open("roleCreator", ModifyRole)
    }

    createNewRole() {
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
                <div>

                </div>
            </div>,
            onOk: () => {
                return new Promise((resolve, reject) => {
                    const roleValue = inputRoleRef.current.state.value
                    const roleDescription = inputDescriptionRef.current.state.value

                    console.log(roleDescription)

                    // TODO: post to api 

                })
            }
        })
    }

    render() {
        if (!this.state.data) return <LoadingSpinner />

        return <div className="users_list_wrapper" >
            <antd.Card style={{ marginBottom: "18px" }}>
                <antd.Button onClick={() => { this.openRoleCreator() }} icon={<Icons.PlusOutlined />} type="primary">Create new</antd.Button>
            </antd.Card>
            <antd.List
                dataSource={this.state.data}
                renderItem={(item) => {
                    return <div key={item._id}>
                        <antd.List.Item
                            actions={[<a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">apply</a>]}
                        >
                            <antd.List.Item.Meta
                                avatar={<Icons.Box />}
                                title={item.name}
                                description={item.description}
                            />
                        </antd.List.Item>
                    </div>
                }}
            />
        </div>

    }
}