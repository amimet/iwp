import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@nodecorejs/utils' 
import * as Icons from 'components/Icons'

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

class AddVaultDevice extends React.Component {

    state = { visible: false }

    showDrawer = () => {
        this.setState({
            visible: true,
        })
    }

    onClose = () => {
        this.setState({
            visible: false,
        })
    }
    onChange(value) {
        console.log(`selected ${value}`);
    }

    onBlur() {
        console.log('blur');
    }

    onFocus() {
        console.log('focus');
    }

    onSearch(val) {
        console.log('search:', val);
    }

    renderTypesOptions() {
        return objectToArrayMap(types).map((type) => {
            return <Option value={type.value}> {type.key} </Option>
        })
    }

    render() {
        return <>
            <Button type="primary" onClick={this.showDrawer}> <PlusOutlined /> Add Device </Button>
            <Drawer
                title="Create a new account"
                width={720}
                onClose={this.onClose}
                visible={this.state.visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={this.onClose} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button onClick={this.onClose} type="primary">Submit</Button>
                    </div>
                }
            >
                <Form layout="vertical" hideRequiredMark>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Electronic Type"
                                rules={[{ required: true, message: 'Please select an type' }]}
                            >
                                <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    placeholder="Select a type"
                                    optionFilterProp="children"
                                    onChange={this.onChange}
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                    onSearch={this.onSearch}
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    { this.renderTypesOptions() }
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
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