import React from 'react'
import { objectToArrayMap } from '@nodecorejs/utils'
import { withConnector, settings } from 'core/libs'
import * as antd from 'antd'
import * as Icons from 'components/Icons'

@withConnector
export default class Settings_debug extends React.Component {
    state = {
        data: null
    }

    updateSettings() {
        this.setState({ data: objectToArrayMap(settings.get()) })
    }

    addSetting() {
        const keyRef = React.createRef()
        const valueRef = React.createRef()

        const create = () => {
            const key = keyRef.current.state.value
            const value = valueRef.current.state.value

            settings.set(key, value)
            this.updateSettings()
        }

        antd.Modal.confirm({
            title: 'Add new setting',
            content: <div>
                <antd.Input ref={keyRef} placeholder="key" />
                <antd.Input ref={valueRef} placeholder="value" />
            </div>,
            okText: 'Create',
            onOk: () => create()
        })
    }

    querySetting() {
        const keyRef = React.createRef()

        const updateQueryValue = (e) => {
            const key = keyRef.current.state.value
            _queryModal.update({ content: JSON.stringify(settings.get(key)) })
        }

        const _queryModal = antd.Modal.confirm({
            title: <antd.Input ref={keyRef} onPressEnter={(e) => updateQueryValue(e)} placeholder="key" />,
            content: "EMPTY",
            okText: 'Query',
            onOk: (e) => updateQueryValue(e)
        })
    }

    removeSetting(event) {
        if (event.target.id) {
            settings.remove(event.target.id)
            this.updateSettings()
        }
    }

    componentDidMount() {
        this.updateSettings()
    }

    render() {
        if (!this.state.data) return <div> No data </div>

        return <div>
            <antd.Button type="primary" onClick={() => this.addSetting()}> Add </antd.Button>
            <antd.Button onClick={() => this.querySetting()}> Query </antd.Button>

            <hr />
            <h4> STORE = {settings.storeKey} | voidMutation = {settings.voidMutation ? "Enabled" : "Disabled"} </h4>
            <hr />

            <antd.List
                dataSource={this.state.data}
                renderItem={(item) => {
                    return <div key={item.key} style={{ marginBottom: "10px" }} >
                        <antd.List.Item
                            actions={[<a id={item.key} onClick={(e) => this.removeSetting(e)} >remove</a>]}
                        >
                            <antd.List.Item.Meta
                                avatar={<Icons.Box />}
                                title={item.key}
                                description={<span><Icons.CornerDownRight /> {item.value} </span>}
                            />
                        </antd.List.Item>
                    </div>
                }}
            />
        </div>
    }
}