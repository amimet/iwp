import React from "react"
import * as antd from "antd"
import classnames from "classnames"
import _ from "lodash"

import { Icons } from "components/Icons"
import { Skeleton } from "components"

import "./index.less"

// TODO: Extended Diff mode

const ChangeItem = (props) => {
    const change = props.change

    return <div className={classnames("change", (change.existing ? "modification" : "creation"))} key={change?.new._id}>
        <div className="indicator">
            {change.existing ? <Icons.Edit2 /> : <Icons.FilePlus />}
        </div>
        <div className="content">
            <div className="name">
                <antd.Tag><Icons.Tag />{change?.new.name}</antd.Tag>
            </div>
            {change?._id &&
                <div className="id">
                    <antd.Tag><Icons.Key />{change?._id}</antd.Tag>
                </div>}
            {change?.differences?.length > 0 &&
                <div className="differences">
                    <antd.Tag>{change?.differences?.length} Changes</antd.Tag>
                </div>
            }
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
        <div className="header">
            <div>
                <antd.Tag><Icons.Key />{conflict._id}</antd.Tag>
            </div>
            <div>
                <strong>[{conflict.differences.length} differences]</strong>
            </div>
        </div>
        <div className="diff">
            <div className="state existing">
                <h3>Before</h3>
                <div className="data">
                    {renderProperties(conflict.existing)}
                </div>
            </div>
            <div className="toIcon">
                <Icons.ChevronsRight />
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

    const api = window.app.request

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

    const resolveConflictById = (id) => {
        setChanges([...changes, conflicts.find(conflict => conflict._id === id)])
        setConflicts(conflicts.filter(conflict => conflict._id !== id))
    }

    const resolveAllConflicts = () => {
        setChanges([...changes, ...conflicts])
        setConflicts([])
    }

    const skipConflictById = (id) => {
        setConflicts(conflicts.filter(conflict => conflict._id !== id))
    }

    const skipAllConflicts = () => {
        setConflicts([])
    }

    const computeDifferences = (oldData, newData) => {
        // map differences of object properties values between conflict.existing and conflict.new

        // TODO: Fix, this is not looking for undefined or null values, resulting is not noticing if a property gonna be removed
        return Object.keys(newData).map(key => {
            // ignore _id
            if (key === "_id") {
                return null
            }

            // determine if the property has been deleted, created or changed
            const beforeValue = oldData[key]
            const afterValue = newData[key]

            if (beforeValue !== afterValue) {
                const isCreated = !beforeValue
                const isDeleted = isCreated && !afterValue

                return {
                    key,
                    isCreated,
                    isDeleted,
                    beforeValue,
                    afterValue,
                }
            }
        }).filter(diff => diff)
    }

    const computeChanges = async (items) => {
        setLoading(true)

        let vault = await api.get.fabric(undefined, { type: "vaultItem", additions: ["vaultItemParser"] })

        // flatten properties
        vault = vault.map((item) => {
            return {
                _id: item._id,
                name: item.name,
                ...item.properties
            }
        })

        const conflictsBuf = []
        const changesBuf = []

        for await (let item of items) {
            // skip _id
            item = _.omit(item, ["_id"])

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

            const checkProperties = ["name", "serial"]
            // check if any of the item properties is conflicted with any of the vault items, if so, return the conflict
            const conflicted = vault.find(vaultItem => {
                return checkProperties.some(key => {
                    // if key is nullish or undefined, skip it
                    if (item[key] === null || item[key] === undefined) {
                        return false
                    }
                    return vaultItem[key] === item[key]
                })
            })

            if (conflicted) {
                const conflict = {
                    _id: conflicted._id,
                    differences: await computeDifferences(conflicted, item),
                    existing: conflicted,
                    new: item,
                }

                conflictsBuf.push(conflict)
                continue
            }

            const change = {
                differences: null,
                existing: false,
                new: item,
            }

            changesBuf.push(change)
        }

        setConflicts([...conflicts, ...conflictsBuf])
        setChanges([...changes, ...changesBuf])

        setLoading(false)
    }

    const uploaderProps = {
        name: "file",
        multiple: false,
        accept: ".json",
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
        return <Skeleton />
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

    return <div className="import_data">
        {conflicts.length > 0 ?
            <div>
                <h1>[{conflicts.length}] Conflicts</h1>
                <h4>This item appears to conflict with the existing data, before continuing, please choose what action you want to take to resolve this conflict.</h4>
            </div> :
            <div>
                <h1>[{changes.length}] Changes</h1>
                <h3>Please review and confirm the following changes to be made.</h3>
                <antd.Alert banner message="This actions cannot be reverted" type="warning" />
            </div>}

        {conflicts.length > 0 ?
            <div className="conflicts">
                <ConflictItem
                    conflict={conflicts[0]}
                    overwrite={() => {
                        resolveConflictById(conflicts[0]._id)
                    }}
                    skip={() => {
                        skipConflictById(conflicts[0]._id)
                    }}
                    overwriteAll={() => {
                        resolveAllConflicts()
                    }}
                    skipAll={() => {
                        skipAllConflicts()
                    }}
                />
            </div> :
            <div className="changes">
                {changes.map((change) => {
                    return <ChangeItem change={change} />
                })}

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
