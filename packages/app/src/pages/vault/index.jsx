import React from 'react'
import * as antd from 'antd'
import { objectToArrayMap } from '@corenode/utils'
import { LoadingSpinner } from 'components'

import { Drawer, Button, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const api = window.app.request

class AddVaultDevice extends React.Component {
    state = {
        visible: false,
        regions: []
    }

    ref = React.createRef()

    componentDidMount = async () => {
        // TODO: GET Regions from API
    }

    onCancel = () => {
        this.ref.current.ctx.clearForm()
        this.toogleDrawer(false)
    }

    onClickSubmit = () => {
        this.ref.current.ctx.finish()
    }

    toogleDrawer = (to) => {
        this.setState({
            visible: to ?? !this.state.visible,
        })
    }

    renderTypesOptions() {
        return objectToArrayMap(types).map((type) => {
            return <Select.Option key={type.key} value={type.value}> {type.key} </Select.Option>
        })
    }

    renderLocations() {
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

    onFinish = (values, ref) => {
        console.log(values)
        let fixed = {}
        ref.toogleValidation(true)

        const keys = Object.keys(values)

        keys.forEach((key) => {
            const element = values[key]
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

        try {
            //TODO: PUT ItemVault to API >> body: fixed
 
        } catch (error) {
            console.log(error)

            ref.error("result", "Error processing")
            ref.toogleValidation(false)
        }
    }

    render() {
        if (this.state.loading) {
            return <div> Loading </div>
        }
        return <>
            <Button type="primary" onClick={() => this.toogleDrawer(true)}> <PlusOutlined /> Add Device </Button>
            <Drawer
                title="Add to Vault"
                width="40%"
                onClose={this.onCancel}
                visible={this.state.visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={this.onCancel} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button onClick={this.onClickSubmit} type="primary">Submit</Button>
                    </div>
                }
            >
               <div>

               </div>
            </Drawer>
        </>
    }
}

export default class Vault extends React.Component {
    state = {
        data: null
    }

    componentDidMount = async () => {
        const vault = await api.get.vault()
        this.setState({ data: vault })
    }

    render() {
        if (!this.state.data) return <LoadingSpinner />
        return (
            <div className="app_vault_wrapper">
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