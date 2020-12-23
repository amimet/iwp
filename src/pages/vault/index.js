import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@nodecorejs/utils'
import * as Icons from 'components/Icons'
import { FormGenerator } from 'components'

import { Drawer, Form, Button, Col, Row, Input, Select, DatePicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Option } = Select

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
            return <Option key={type.key} value={type.value}> {type.key} </Option>
        })
    }

    renderRegions() {
        return this.state.regions.map((region) => {
            return <Option key={region.id} value={region.id}> {region.data.name} </Option>
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
                    this.setState({ regions: res.data })
                }
            }
        })
    }

    formInstance = [
        {
            id: "type",
            label: "Type",
            formElement: {
                props: {
                    children: this.renderRegions()
                },
                element: "Select",
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
            label: "Region",
            formElement: {
                element: "Input",
                icon: "Lock",
                placeholder: "Password"
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
        }
    ]

    render() {
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
                        <Button onClick={this.toogleDrawer} type="primary">Submit</Button>
                    </div>
                }
            >

                <FormGenerator
                    name="vault_additem"
                    items={this.formInstance}
                    onFinish={(...context) => {
                        window.currentForms["vault_additem"].toogleValidation(true)
                        console.log(context)
                    }}
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