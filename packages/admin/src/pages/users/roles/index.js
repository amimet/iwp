import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@corenode/utils'
import * as ui from 'core/libs/ui'
import * as Icons from 'components/Icons'

import { LoadingSpinner, FormGenerator } from 'components'

import { Drawer, Button, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

class ModifyRole extends React.Component {
    state = {
        visible: false,
        regions: []
    }

    toogleDrawer = (to) => {
        this.setState({
            visible: (to ?? !this.state.visible),
        })
    }

    componentDidMount() {
        this.toogleDrawer(true)
    }

    handleSubmit(context) {
        try {
            console.log(context)
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        if (this.state.loading) return <div> Loading </div>

        return <>
            <Button type="primary" onClick={this.toogleDrawer}> <PlusOutlined /> Create new </Button>
            <Drawer
                title="Add new role"
                width={"40%"}
                onClose={this.toogleDrawer}
                visible={this.state.visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={this.toogleDrawer} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button onClick={() => window.currentForms["roles_createnew"].handleFinish()} type="primary">Submit</Button>
                    </div>
                }
            >
                <FormGenerator
                    name="roles_createnew"
                    renderLoadingIcon
                    onFinish={(context) => this.handleSubmit(context)}
                    items={[
                        {
                            id: "title",
                            title: "Role name",
                            formElement: {
                                element: "Input"
                            },
                            formItem: {
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
                            formElement: {
                                element: "Select",
                                props: {
                                    mode: "multiple",
                                    allowClear: true,
                                    children: this.renderPermissionsOptions()
                                }
                            },
                            formItem: {
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

            </Drawer>
        </>
    }
}

export default class Roles extends React.Component {
    state = {
        data: null,
    }

    componentDidMount() {
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "roles"
            },
            callback: (err, res, status) => {
                if (err) {
                    ui.Notify.error({
                        title: "Error fetching roles",
                        message: `API Response with code [${status}] > ${res}`
                    })
                    return false
                }
                if (typeof (res) == "object") {
                    this.setState({ data: res })
                }
            }
        })
    }

    modifyRole() {
    
    }

    createNewRole() {
        let inputRoleRef = React.createRef()
        let inputDescriptionRef = React.createRef()

        antd.Modal.confirm({
            title: "Create a new role",
            content: <div className={window.classToStyle("new_role_form")}>
                <div>
                    <antd.Input ref={inputRoleRef} placeholder="Role name" />
                </div>
                <div>
                    <antd.Input ref={inputDescriptionRef} placeholder="Description" />
                </div>
            </div>,
            onOk: () => {
                return new Promise((resolve, reject) => {
                    const roleValue = inputRoleRef.current.state.value
                    const roleDescription = inputDescriptionRef.current.state.value

                    console.log(roleDescription)

                    window.dispatcher({
                        type: "api/request",
                        payload: {
                            method: "POST",
                            endpoint: "role",
                            body: { name: roleValue, description: roleDescription }
                        },
                        callback: (err, res, status) => {
                            if (err) {
                                if (status == 409) {
                                    ui.Notify.error({
                                        title: "Error creating role",
                                        message: `[${status}] > ${res.data}`
                                    })
                                }

                                return reject()
                            }
                            console.log(res)
                            return resolve()
                        }
                    })
                })
            }
        })
    }

    render() {
        if (!this.state.data) return <LoadingSpinner />

        return <div className={window.classToStyle("users_list_wrapper")} >
            <antd.Card style={{ marginBottom: "18px" }}>
                <antd.Button onClick={() => { this.createNewRole() }} icon={<PlusOutlined />} type="primary">Create new</antd.Button>
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