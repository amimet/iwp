import React from "react"
import * as antd from "antd"
import { Modal, Toast } from "antd-mobile"
import { Translation } from "react-i18next"
import classnames from "classnames"

import moment from "moment"

import { QuantityInput } from "components"
import { Icons, createIconRender } from "components/Icons"

import FORMULAS from "schemas/fabricFormulas"

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
        running: false,
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

    toogleRunning = (to) => {
        to = to ?? !this.state.running

        this.setState({ running: to })

        if (to) {
            this.counter.update("start")
        } else {
            this.counter.update("stop")
        }
    }

    manualQuantityPicker = async () => {
        const modal = Modal.show({
            title: <Translation>
                {(t) => t("Mark produced quantity")}
            </Translation>,
            content: <QuantityInput
                onOk={async (value) => {
                    await this.submitCommit(value)
                    modal.close()
                }}
                onClose={() => {
                    modal.close()
                }}
            />
        })
    }

    submitCommit = async (quantity, tooks) => {
        quantity = quantity ?? 1

        const quantityLeft = this.countQuantityLeft()

        const makeCommit = async () => {
            await this.api.post.workloadCommit({
                workloadId: this.state.workload._id,
                payloadUUID: this.uuid,
                quantity: quantity,
                tooks: tooks,
            }).catch((error) => {
                console.error(error)
                antd.message.error(`Failed to commit: ${error}`)

                return false
            })

            Toast.show({
                icon: "success",
                content: "Commited",
            })
        }

        if (quantityLeft <= 0) {
            antd.Modal.confirm({
                title: <Translation>
                    {(t) => t("Production quantity already has been reached")}
                </Translation>,
                content: <Translation>
                    {(t) => t("Are you sure you want to commit for this workpart?")}
                </Translation>,
                onOk: async () => {
                    return await makeCommit()
                },
            })
        } else {
            await makeCommit()
        }
    }

    onWorkpartFinished = () => {
        if (typeof this.props.close === "function") {
            this.props.close()
        }

        Toast.show({
            icon: "success",
            content: "Finished",
        })
    }

    onMakeStep = async () => {
        if (this.countQuantityLeft() === 0) {
            console.warn("No quantity left")
            return false
        }

        this.counter.update("stop")

        await this.submitCommit(1, this.counter.tooks())

        this.counter.update("start")

        if (this.countQuantityLeft() === 0) {
            this.toogleRunning(false)
            this.onWorkpartFinished()
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
                    <div className="name">
                        <Translation>
                            {t => t(String(key).toTitleCase())}
                        </Translation>
                    </div>
                    <div className="value">
                        <PropertyRender />
                    </div>
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
                    <h1>
                        {Icons[formula.icon] && createIconRender(formula.icon)}
                        <Translation>
                            {t => t(String(this.state.data.type).toTitleCase())}
                        </Translation>
                    </h1>
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
            </div>}

            <div className="production">
                <h3>
                    <Icons.Disc />
                    <Translation>
                        {t => t("Production target")}
                    </Translation>
                </h3>

                <div className="content">
                    <div className="counter">
                        <div
                            style={this.isQuantityProductionOverreached() ? { color: "red" } : undefined}
                            className={quantityLeft === 0 ? "completed" : undefined}
                        >
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

            <div className="assistant">
                <div className={classnames("controls", { ["running"]: this.state.running })}>
                    <div>
                        <antd.Button
                            type="primary"
                            disabled={quantityLeft === 0}
                            onClick={() => this.toogleRunning()}
                            icon={this.state.running ? <Icons.Pause /> : <Icons.Clock />}
                        >
                            <Translation>
                                {t => t(this.state.running ? "Stop" : "Start")}
                            </Translation>
                        </antd.Button>
                    </div>
                    {this.state.running ? <div>
                        <antd.Button
                            icon={<Icons.Plus />}
                            disabled={quantityLeft === 0}
                            onClick={this.onMakeStep}
                        >
                            1
                        </antd.Button>
                    </div> : <div>
                        <antd.Button
                            onClick={() => this.manualQuantityPicker()}
                        >
                            <Translation>
                                {t => t("Mark quantity")}
                            </Translation>
                        </antd.Button>
                    </div>
                    }
                </div>
            </div>
        </div>
    }
}