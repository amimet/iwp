import React from 'react'
import * as antd from 'antd'
import { Icons } from 'components/icons'

import { ActionsBar, FormGenerator } from 'components'

const api = window.app.request

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
        window.app.DrawerController.open("roleCreator", ModifyRole)
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
        return <div className="users_list_wrapper" >
            <ActionsBar float={true}>
                <antd.Button onClick={() => { this.openRoleCreator() }} icon={<Icons.PlusOutlined />} type="primary">New</antd.Button>
            </ActionsBar>

            {!this.state.data ? <antd.Skeleton active /> :
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
                />}
        </div>
    }
}