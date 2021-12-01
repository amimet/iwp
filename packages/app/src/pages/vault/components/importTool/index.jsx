import React from 'react'
import * as antd from 'antd'
import { Icons } from "components/Icons"

import "./index.less"

// TODO: Extended Diff mode

const api = window.app.request

const ChangeItem = (props) => {
    const change = props.change
    console.log(change)
    return <div className="change" key={change?._id}>
        <div className="name">
            {change?.name}
        </div>
        <div className="id">
            {change?._id}
        </div>
    </div>
}

const ConflictItem = (props) => {
    const conflict = props.conflict

    const renderProperties = (properties) => {
        return Object.keys(properties).map(key => {
            if (key === "_id") {
                return null
            }

            return <div className="property">
                <div className="key">
                    {String(key).toTitleCase()}
                </div>
                <div className="value">
                    {String(properties[key])}
                </div>
            </div>
        }).filter(item => item)
    }

    return <div className="conflict" id={conflict._id} key={conflict._id}>
        <div>
            <h3>#{conflict._id}</h3>
            <strong>[{conflict.differences.length} differences]</strong>
        </div>
        <div className="diff">
            <div className="state existing">
                <h3>Before </h3>
                <div className="data">
                    {renderProperties(conflict.existing)}
                </div>
            </div>
            <div className="state new">
                <h3>After</h3>
                <div className="data">
                    {renderProperties(conflict.new)}
                </div>
            </div>
        </div>
        <div>
            <div className="actions">
                <antd.Button type="default" onClick={props.skip}>
                    <Icons.X />
                    <span>Skip</span>
                </antd.Button>
                <antd.Button type="default" onClick={props.skipAll}>
                    <Icons.Slash />
                    <span>Skip All</span>
                </antd.Button>
                <antd.Button type="danger" onClick={props.overwrite}>
                    <Icons.Check />
                    <span>Overwrite</span>
                </antd.Button>
                <antd.Button type="danger" onClick={props.overwriteAll}>
                    <Icons.Save />
                    <span>Overwrite All</span>
                </antd.Button>
            </div>
        </div>
    </div>
}

export default (props) => {
    const [loading, setLoading] = React.useState(false)
    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState(null)

    const [data, setData] = React.useState(null)

    const [conflicts, setConflicts] = React.useState([])
    const [changes, setChanges] = React.useState([])

    props.events.on("error", (error) => {
        setError(error)
    })

    const resetAll = () => {
        setConflicts([])
        setChanges([])
        setData(null)
        setError(null)
        setLoading(false)
        setSubmitting(false)
    }

    const handleSubmit = () => {
        setSubmitting(true)
        props.handleDone(changes)
    }

    const pushChange = (change) => {
        let query = []

        if (Array.isArray(change)) {
            query = change
        }else {
            query.push(change)
        }
        
        query.forEach((change) => {
            const newChanges = [...changes, {
                _id: change._id,
                data: change
            }]

            setChanges(newChanges)
        })
    }

    const resolveConflictById = (id) => {
        pushChange(conflicts.find(conflict => conflict._id === id))
        setConflicts(conflicts.filter(conflict => conflict._id !== id))
    }

    const resolveAllConflicts = () => {
        pushChange(conflicts)
        setConflicts([])
    }

    const skipConflict = (id) => {
        setConflicts(conflicts.filter(conflict => conflict._id !== id))
    }

    const skipAllConflicts = () => {
        setConflicts([])
    }

    const computeDifferences = (oldData, newData) => {
        // map differences of object properties values between conflict.existing and conflict.new
        return Object.keys(newData).map(key => {
            // determine if the property has been deleted, created or changed
            const existing = oldData[key]
            const newValue = newData[key]

            const isDeleted = existing === undefined
            const isCreated = newValue === undefined
            const isChanged = existing !== newValue

            if (oldData[key] !== newData[key]) {
                return {
                    key,
                    isDeleted,
                    isCreated,
                    isChanged,
                    existing,
                    newValue
                }
            }
        }).filter(diff => diff)
    }

    const computeChanges = async (items) => {
        setLoading(true)

        const vault = await api.get.fabric(undefined, { type: "vaultItem", additions: ["vaultItemParser"] })

        let changesBuf = []
        let conflictsBuf = []

        for await (let item of items) {
            // remove null, undefined and empty values of all object properties
            item = Object.keys(item).reduce((acc, key) => {
                if (item[key] !== null && item[key] !== undefined && item[key] !== "") {
                    acc[key] = item[key]
                }
                return acc
            }, {})

            // if item has no properties, skip it
            if (Object.keys(item).length === 0) {
                continue
            }

            let existing = vault.find(i => i._id === item._id)

            if (existing) {
                // flatten existing properties
                existing = {
                    _id: existing._id,
                    name: existing.name,
                    ...existing.properties,
                }

                conflictsBuf.push({
                    _id: item._id,
                    differences: computeDifferences(existing, item),
                    existing: existing,
                    new: item,
                })
            } else {
                pushChange(item)
            }
        }

        setChanges(changesBuf)
        setConflicts(conflictsBuf)

        setLoading(false)
    }

    const uploaderProps = {
        name: 'file',
        multiple: false,
        accept: '.json',
        beforeUpload(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()

                reader.readAsText(file)
                reader.onload = () => {
                    try {
                        const result = JSON.parse(reader.result)

                        setLoading(true)
                        setData(result)
                        computeChanges(result)

                        return resolve()
                    } catch (error) {
                        setError(`Error parsing file: ${error.message}`)
                        return reject()
                    }
                }
            })
        }
    }

    if (error) {
        return <antd.Result
            status="error"
            title="Failed to import"
            subTitle={error}
            extra={[
                <antd.Button onClick={() => props.close()}>
                    Close
                </antd.Button>,
                <antd.Button type="primary" onClick={() => resetAll()}>
                    Retry
                </antd.Button>,
            ]}
        />
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

    if (changes.length === 0 && conflicts.length === 0) {
        return <antd.Result
            title="No changes detected"
            extra={[
                <antd.Button onClick={() => props.close()}>
                    Close
                </antd.Button>,
                <antd.Button type="primary" onClick={() => resetAll()}>
                    Retry
                </antd.Button>,
            ]}
        />
    }

    return <div className="import_data_wrapper">
        {conflicts.length > 0 ?
            <div className="conflicts">
                <h1><Icons.AlertTriangle /> Conflicts [{conflicts.length}]</h1>
                <h3>These items already exist, before continue, select the items for overwrite the current existing item.</h3>
                <div>
                    <ConflictItem
                        conflict={conflicts[0]}
                        overwrite={() => {
                            resolveConflictById(conflicts[0]._id)
                        }}
                        skip={() => {
                            skipConflict(conflicts[0]._id)
                        }}
                        overwriteAll={() => {
                            resolveAllConflicts()
                        }}
                        skipAll={() => {
                            skipAllConflicts()
                        }}
                    />
                </div>
            </div> :
            <div>
                <h2>Changes [{changes.length}]</h2>
                <div className="changes">
                    {changes.map((change) => {
                        return <ChangeItem change={change} />
                    })}
                </div>

                <div className="actions">
                    <antd.Button disabled={submitting} onClick={() => props.close()}>
                        <span>Cancel</span>
                    </antd.Button>
                    <antd.Button type="primary" loading={submitting} onClick={() => handleSubmit()}>
                        <Icons.Save />
                        <span>Import</span>
                    </antd.Button>
                </div>
            </div>
        }
    </div>
}
