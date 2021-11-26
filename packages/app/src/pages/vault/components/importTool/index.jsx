import React from 'react'
import * as antd from 'antd'
import { Icons } from "components/Icons"
import { ActionsBar, SelectableList } from 'components'
import classnames from 'classnames'

import "./index.less"

const api = window.app.request

export default (props) => {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    const [data, setData] = React.useState(null)

    const [conflicts, setConflicts] = React.useState([])
    const [changes, setChanges] = React.useState([])

    const computeChanges = async (obj) => {
        setLoading(true)

        const vault = await api.get.fabric(undefined, { type: "vaultItem", additions: ["vaultItemParser"] })
        
        let additionIds = []
        let conflictedIds = []

        for await (let item of obj) {
            const existing = vault.find(i => i._id === item._id)

            if (existing) {
                conflictedIds.push(item._id)
            } else {
                additionIds.push(item._id)
            }
        }

        setChanges(additionIds)
        setConflicts(conflictedIds)

        setLoading(false)
    }

    const uploaderProps = {
        name: 'file',
        multiple: false,
        accept: '.json',
        beforeUpload(file) {
            return new Promise(resolve => {
                const reader = new FileReader()

                reader.readAsText(file)
                reader.onload = () => {
                    const result = JSON.parse(reader.result)

                    setLoading(true)
                    setData(result)
                    computeChanges(result)
                    return resolve()
                }
            })
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files)
        },
    }

    if (!data) {
        return <div>
            <antd.Upload.Dragger {...uploaderProps}>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </antd.Upload.Dragger>
        </div>
    }

    if (loading) {
        return <antd.Skeleton active />
    }

    return <div>
        <div className="importTool">
            <div className="header">
                <h1>Import</h1>
                <h4>{data.length} items</h4>
            </div>
            <div className="content">
                <div className="left">
                    <div className="conflicts">
                        <h2>Conflicts [{conflicts.length}]</h2>
                    </div>
                    <div className="changes">
                        <h2>Changes [{changes.length}]</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
