import React from "react"
import * as antd from "antd"
import { Toast } from "antd-mobile"

import moment from "moment"

import { Icons, createIconRender } from "components/Icons"
import { ActionsBar } from "components"

import FORMULAS from "schemas/fabricFormulas"
import { Commit } from ".."

import "./index.less"

class Counter {
    constructor() {
        this.times = {
            start: null,
            stop: null,
        }
    }

    update(type) {
        this.times[type] = moment()
    }

    tooks() {
        return this.times.stop.diff(this.times.start)
    }
}

export default class Inspector extends React.Component {
    state = {
        loading: true,
        workload: null,
        data: null,
    }

    counter = new Counter()

    api = window.app.request

    componentDidMount = async () => {
        this.uuid = this.props.payload?.uuid ?? this.props.uuid

        if (!this.uuid) {
            console.error("No UUID provided")
            return false
        }

        await this.fetchWorkloadDataWithUUID()

        if (this.props.payload) {
            await this.setState({ data: this.props.payload })
        } else {
            const data = this.state.workload.payloads.find((payload) => payload.payloadUUID === this.uuid)
            await this.setState({ data })
        }

        window.app.handleWSListener(`newCommit_${this.uuid}`, (data) => {
            let workload = this.state.workload

            if (!workload.commits) {
                workload.commits = []
            }

            workload.commits.push(data.commit)

            this.setState({ workload })
        })
    }

    fetchWorkloadDataWithUUID = async () => {
        this.toogleLoading(true)

        const data = await this.api.get.workloadPayloadUuid(undefined, { uuid: this.uuid }).catch((err) => {
            console.error(err)
            antd.message.error(`Failed to load workload: ${err}`)
            return false
        })

        if (data) {
            this.toogleLoading(false)
            return await this.setState({ workload: data })
        }
    }

    findCommitsAssociated = () => {
        if (!this.state.workload.commits || this.state.workload.commits.length === 0) {
            return false
        }

        return this.state.workload.commits.filter((commit) => commit.payloadUUID === this.uuid)
    }

    countQuantityFromCommits = () => {
        let count = 0
        const commits = this.findCommitsAssociated()

        if (commits) {
            commits.forEach(commit => {
                if (commit.quantity) {
                    count += commit.quantity
                }
            })
        }

        return count
    }

    countQuantityLeft = (absolute) => {
        const quantity = this.state.data.properties?.quantity
        const quantityCount = this.countQuantityFromCommits()

        let result = quantity - quantityCount

        if (result < 0 && !absolute) {
            result = 0
        }

        return result
    }

    isQuantityProductionOverreached = () => {
        return Boolean(this.countQuantityLeft(true) < 0)
    }

    toogleLoading = (to) => {
        this.setState({ loading: to ?? !this.state.loading })
    }

    onClickCommit = () => {
        const open = () => Commit.openModal({
            workloadId: this.props.workloadId,
            payloadUUID: this.uuid,
        })
        const quantityLeft = this.countQuantityLeft()

        if (quantityLeft <= 0) {
            antd.Modal.confirm({
                title: "Production quantity already has been reached",
                content: "Are you sure you want to commit for this payload?",
                onOk: () => {
                    open()
                },
            })
        } else {
            open()
        }
    }

    toogleAssistantMode = (to) => {
        to = to ?? !this.state.assistantMode

        this.setState({ assistantMode: to })

        if (to) {
            this.counter.update("start")
        }
    }

    onMakeStep = async () => {
        if (this.countQuantityLeft() === 0) {
            console.warn("No quantity left")
            return false
        }

        this.counter.update("stop")
        const tooks = this.counter.tooks()

        const result = await this.api.post.workloadCommit({
            workloadId: this.state.workload._id,
            payloadUUID: this.state.data.uuid,
            tooks: tooks,
            quantity: 1,
        }).catch((err) => {
            console.error(err)
            antd.message.error(`Failed to commit: ${err}`)
            return false
        })

        if (result) {
            this.counter.update("start")
            Toast.show({
                icon: "success",
                content: "Done"
            })
        }
    }

    renderProperties = (item) => {
        if (!item.properties) {
            return null
        }

        return Object.keys(item.properties).map((key) => {
            const PropertyRender = () => {
                const property = item.properties[key]

                if (property == null) {
                    return <antd.Tag>None</antd.Tag>
                }

                if (Array.isArray(property)) {
                    return property.map((prop) => {
                        return <antd.Tag style={{ marginBottom: "5px" }}>{prop}</antd.Tag>
                    })
                }

                return property
            }

            return (
                <div className="property" key={key}>
                    <div className="name">{String(key).toTitleCase()}</div>
                    <div className="value"><PropertyRender /></div>
                </div>
            )
        })
    }

    render() {
        if (!this.state.data || this.state.loading) {
            return <antd.Skeleton active />
        }

        const formula = FORMULAS[this.state.data.type]

        if (!formula) {
            return <div>No formula found for this type</div>
        }

        const quantityCount = this.countQuantityFromCommits()
        const quantityLeft = this.countQuantityLeft()

        // calculate percent for reach target quantity
        const percent = Math.round((quantityCount / this.state.data.properties.quantity) * 100)

        return <div className="payload_inspector">
            <div className="header">
                <div className="typeIndicator">
                    <h1>{Icons[formula.icon] && createIconRender(formula.icon)} {String(this.state.data.type).toTitleCase()}</h1>
                </div>
                <div>
                    <h1>{this.state.data.name}</h1>
                </div>
                <div>
                    <h3>#{String(this.state.data.uuid).toUpperCase()}</h3>
                </div>
            </div>

            {!this.state.assistantMode && <div className="properties">
                {this.renderProperties(this.state.data)}
                <div className="property">
                    <div className="name">Quantity produced</div>
                    <div className="value">{quantityCount}</div>
                </div>
                <div className="property">
                    <div className="name">Quantity left</div>
                    <div className="value">{quantityLeft}</div>
                </div>
            </div>}

            <div className="production">
                <h3><Icons.Disc /> Production target</h3>

                <div className="content">
                    <div className="counter">
                        <div style={this.isQuantityProductionOverreached() ? { color: "red" } : undefined} className={quantityLeft === 0 ? "completed" : undefined} >
                            {quantityCount}
                        </div>
                        <div>/</div>
                        <div>
                            {this.state.data.properties?.quantity ?? "?"}
                        </div>
                    </div>
                </div>

                <antd.Progress percent={percent} />
            </div>

            {this.state.assistantMode && <div className="assistant">
                <div className="controls">
                    <div>
                        <antd.Button disabled={quantityLeft === 0} onClick={this.onMakeStep} icon={<Icons.Plus />} type="primary">
                            1
                        </antd.Button>
                    </div>
                    <div>
                        <antd.Button onClick={() => this.toogleAssistantMode(false)} icon={<Icons.LogOut />}>
                            Stop
                        </antd.Button>
                    </div>
                </div>
            </div>}

            {!this.state.assistantMode && <ActionsBar mode="float" type="transparent" spaced>
                <div>
                    <antd.Button onClick={() => this.onClickCommit()} icon={<Icons.CheckCircle />}>
                        Commit
                    </antd.Button>
                </div>
                <div>
                    <antd.Button
                        disabled={quantityLeft === 0}
                        onClick={() => this.toogleAssistantMode()}
                        type={this.state.assistantMode ? undefined : "primary"}
                        icon={this.state.assistantMode ? <Icons.ChevronLeft /> : <Icons.MdOutlinePendingActions />}
                    >
                        {this.state.assistantMode ? "Exit" : "Assistant mode"}
                    </antd.Button>
                </div>
            </ActionsBar>}
        </div>
    }
}