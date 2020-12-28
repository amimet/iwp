import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@nodecorejs/utils'
import { FormGenerator } from 'components'

import { Drawer, Button, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const types = {
    "Computer desktop": "01",
    "Laptop": "02",
    "Network material": "03",
    "Server": "04",
    "Mobile & Tablet": "05",
    "Other": "00",
}

const categoriesKeys = {
    chipsets: {
        "I": "Intel Chipset",
        "A": "Amd Chipset",
        "N": "Null"
    },
    year: {

    },
    tier: {
        "L": "Low/end tier",
        "M": "Mid tier",
        "H": "High tier",
        "N": "Null"
    }
}


class AddVaultDevice extends React.Component {

    state = {
        visible: false,
        regions: [],
        device: {
            type: 0,
            region: 0,
            cat: 0,
            stash: 0,
            serial: ''
        }
    }

    toogleDrawer = () => {
        this.setState({
            visible: !this.state.visible,
        })
    }

    updateDeviceState = (type, value) => {
        let state = this.state.device
        state[type] = value
        this.setState(state)
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

    renderCategories() {

    }

    componentDidMount() {
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "regions"
            },
            callback: (err, res) => {
                if (!err) {
                    this.setState({ loading: false, regions: res.data })
                }
            }
        })
    }

    handleSubmit(context) {
        window.currentForms["vault_additem"].toogleValidation(true)

        console.log(context)
        setTimeout(() => {
            window.currentForms["vault_additem"].toogleValidation(false)
        }, 4000)
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
                            id: "region",
                            title: "Region",
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
                            title: "Category",
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
                    ]}
                />

            </Drawer>
        </>
    }
}

export default class Vault extends React.Component {

    state = {
        data: []
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
                    this.setState({ data: res.data })
                }
            }
        })
    }


    render() {
        return (
            <div className={window.classToStyle('vault_wrapper')}>
                <antd.Card>
                    <AddVaultDevice />
                </antd.Card>
                <antd.List
                    dataSource={this.state.data}
                    renderItem={(item) => {
                        return <div>
                            {JSON.stringify(item)}
                        </div>
                    }}
                />
            </div>
        )
    }
}