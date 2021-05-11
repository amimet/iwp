import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@corenode/utils'
import { FormGenerator } from 'components'

import { Drawer, Button, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { LoadingSpinner } from 'components'

const types = {
    "Computer desktop": "1",
    "Laptop": "2",
    "Network material": "3",
    "Server": "4",
    "Mobile & Tablet": "5",
    "Other": "0",
}

const categoriesKeys = {
    chipset: {
        "I": "Intel Chipset",
        "A": "Amd Chipset",
        "N": "Not apply"
    },
    tier: {
        "L": "Low/end tier",
        "M": "Mid tier",
        "H": "High tier",
        "N": "Not apply"
    }
}


class AddVaultDevice extends React.Component {
    state = {
        visible: false,
        regions: []
    }

    toogleDrawer = () => {
        this.setState({
            visible: !this.state.visible,
        })
    }

    renderTypesOptions() {
        return objectToArrayMap(types).map((type) => {
            return <Select.Option key={type.key} value={type.value}> {type.key} </Select.Option>
        })
    }

    renderRegions() {
        return this.state.regions.map((region) => {
            return <Select.Option key={region.id} value={region.id}> {region.data.name} </Select.Option>
        })
    }

    renderCategories(type) {
        if (!type) return false
        return objectToArrayMap(categoriesKeys[type]).map((e) => {
            return <Select.Option id={e.value} value={e.key}> {e.value} </Select.Option>
        })
    }

    componentDidMount() {
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "regions"
            },
            callback: (err, res) => {
                if (err) {
                    return false
                }
                this.setState({ loading: false, regions: res })
            }
        })
    }

    handleSubmit(context) {
        let fixed = {}
        window.currentForms["vault_additem"].toogleValidation(true)

        try {
            const keys = Object.keys(context)
            keys.forEach((key) => {
                const element = context[key]
                if (typeof (element) !== "undefined") {
                    switch (key) {
                        case "manufacture": {
                            fixed[key] = element.year()
                            break
                        }
                        default: {
                            fixed[key] = element
                            break
                        }
                    }

                }
            })

            window.dispatcher({
                type: "api/request",
                payload: {
                    method: "PUT",
                    endpoint: "itemVault",
                    body: fixed
                },
                callback: (err, res) => {
                    window.currentForms["vault_additem"].handleFormError("all", false)

                    if (err) {
                        window.currentForms["vault_additem"].handleFormError("result", res.err)
                        window.currentForms["vault_additem"].toogleValidation(false)
                        return
                    }

                    window.currentForms["vault_additem"].toogleValidation(false)
                    this.toogleDrawer()
                }
            })
        } catch (error) {
            console.log(error)
            window.currentForms["vault_additem"].handleFormError("result", "Error processing")
            window.currentForms["vault_additem"].toogleValidation(false)
        }

    }

    render() {
        if (this.state.loading) {
            return <div> Loading </div>
        }
        return <>
            <Button type="primary" onClick={this.toogleDrawer}> <PlusOutlined /> Add Device </Button>
            <Drawer
                title="Add to Vault"
                width={"40%"}
                onClose={this.toogleDrawer}
                visible={this.state.visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={this.toogleDrawer} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button onClick={() => window.currentForms["vault_additem"].handleFinish()} type="primary">Submit</Button>
                    </div>
                }
            >

                <FormGenerator
                    name="vault_additem"
                    renderLoadingIcon
                    onFinish={(context) => this.handleSubmit(context)}
                    items={[
                        {
                            id: "title",
                            title: "Device name",
                            formElement: {
                                element: "Input"
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
                        {
                            id: "type",
                            title: "Type",
                            formElement: {
                                element: "Select",
                                renderItem: this.renderTypesOptions(),
                            },
                            formItem: {
                                hasFeedback: true,
                                rules: [
                                    {
                                        required: true,
                                        message: 'Select an type!',
                                    },
                                ]
                            }
                        },
                        {
                            id: "state",
                            title: "State",
                            formElement: {
                                element: "Input",
                            }
                        },
                        {
                            formElement: {
                                element: "Divider",
                                props: { dashed: true, children: "Geo info" }
                            }
                        },
                        {
                            id: "region",
                            title: "Origin",
                            formElement: {
                                element: "Select",
                                renderItem: this.renderRegions(),
                            },
                            formItem: {
                                hasFeedback: true,
                                rules: [
                                    {
                                        required: true,
                                        message: 'Select an region!',
                                    },
                                ],
                            }
                        },
                        {
                            id: "currentLocation",
                            title: "Location",
                            formElement: {
                                element: "Select",
                                renderItem: this.renderRegions(),
                            },
                            formItem: {
                                hasFeedback: true,
                                rules: [
                                    {
                                        required: true,
                                        message: 'Select an region!',
                                    },
                                ],
                            }
                        },
                        {
                            formElement: {
                                element: "Divider",
                                props: { dashed: true }
                            }
                        },
                        {
                            id: "cat",
                            group: [
                                {
                                    id: "chipset",
                                    title: "Chipset",
                                    formElement: {
                                        element: "Select",
                                        renderItem: this.renderCategories("chipset"),
                                    },
                                    formItem: {
                                        hasFeedback: true,
                                        rules: [
                                            {
                                                required: true,
                                                message: 'Select an chipset!',
                                            },
                                        ],
                                    }
                                },
                                {
                                    id: "manufacture",
                                    title: "Year",
                                    formElement: {
                                        element: "DatePicker",
                                        props: {
                                            picker: "year",
                                        }
                                    },
                                    formItem: {
                                        hasFeedback: true,
                                        rules: [
                                            {
                                                required: true,
                                                message: 'Select an year!',
                                            },
                                        ],
                                    }
                                },
                                {
                                    id: "tier",
                                    title: "Tier",
                                    formElement: {
                                        element: "Select",
                                        renderItem: this.renderCategories("tier"),
                                    },
                                    formItem: {
                                        hasFeedback: true,
                                        rules: [
                                            {
                                                required: true,
                                                message: 'Select an tier!',
                                            },
                                        ],
                                    }
                                },
                            ],
                        },
                        {
                            formElement: {
                                element: "Divider",
                                props: { dashed: true }
                            }
                        },
                        {
                            id: "serial",
                            title: "Serial Number",
                            formElement: {
                                element: "Input",
                                props: {
                                    maxLength: 5
                                }
                            },
                            formItem: {
                                hasFeedback: true,
                                rules: [
                                    {
                                        required: true,
                                        message: 'Input the last 5 digits of serial number',
                                    },
                                ],
                            }
                        },
                        {
                            formElement: {
                                element: "Divider",
                                props: { dashed: true }
                            }
                        },
                        {
                            id: "active",
                            title: "On service",
                            formElement: {
                                element: "Switch",
                            }
                        },
                        {
                            id: "comment",
                            title: "Comment",
                            formElement: {
                                element: "Input",

                            }
                        },
                    ]}
                />

            </Drawer>
        </>
    }
}

export default class Vault extends React.Component {
    state = {
        data: null
    }

    componentDidMount() {
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "vault"
            },
            callback: (err, res) => {
                if (!err) {
                    this.setState({ data: res })
                }
            }
        })
    }

    render() {
        if (!this.state.data) return <LoadingSpinner />
        return (
            <div className={window.classToStyle('vault_wrapper')}>
                <antd.Card style={{ marginBottom: "18px" }}>
                    <AddVaultDevice />
                </antd.Card>
                <antd.List
                    dataSource={this.state.data}
                    renderItem={(i) => {
                        console.log(i)
                        return <antd.Card key={i.id}>
                            #{i.id}
                            <div>
                                <h1>{i.item?.title ?? "Device"}</h1>
                                <antd.Tag color={i.item?.active ? "green" : "red"} > {i.item?.active ? "On service" : "Retired"} </antd.Tag>
                                <antd.Tag> {i.item?.state ?? "Unknown"} </antd.Tag>
                            </div>
                        </antd.Card>
                    }}
                />
            </div>
        )
    }
}