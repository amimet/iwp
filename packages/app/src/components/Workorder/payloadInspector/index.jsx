import React from "react"
import * as antd from "antd"
import { Modal, Toast, Swiper, Image } from "antd-mobile"
import { Translation } from "react-i18next"
import classnames from "classnames"

import moment from "moment"

import { QuantityInput, Skeleton } from "components"
import { Icons, createIconRender } from "components/Icons"

import FORMULAS from "schemas/fabricFormulas"

import "./index.less"

const excludedProperties = ["imagePreview"]

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
        workorder: null,
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

        await this.fetchWorkorderDataWithUUID()

        if (this.props.payload) {
            await this.setState({ data: this.props.payload })
        } else {
            const data = this.state.workorder.payloads.find((payload) => payload.payloadUUID === this.uuid)
            await this.setState({ data })
        }

        window.app.handleWSListener(`newCommit_${this.uuid}`, (data) => {
            let workorder = this.state.workorder

            if (!workorder.commits) {
                workorder.commits = []
            }

            workorder.commits.push(data.commit)

            this.setState({ workorder })
        })
    }

    fetchWorkorderDataWithUUID = async () => {
        this.toogleLoading(true)

        const data = await this.api.get.workorderPayloadUuid(undefined, { uuid: this.uuid }).catch((err) => {
            console.error(err)
            antd.message.error(`Failed to load workorder: ${err}`)
            return false
        })

        if (data) {
            this.toogleLoading(false)
            return await this.setState({ workorder: data })
        }
    }

    findCommitsAssociated = () => {
        if (!this.state.workorder.commits || this.state.workorder.commits.length === 0) {
            return false
        }

        return this.state.workorder.commits.filter((commit) => commit.payloadUUID === this.uuid)
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

    toogleRunning = async (to) => {
        to = to ?? !this.state.running

        await this.setState({ running: to })

        if (to) {
            // TODO: emit event to server
            this.counter.update("start")
        } else {
            // TODO: emit event to server
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
                    if (value > 0) {
                        await this.submitCommit(value)
                        modal.close()
                    }
                }}
                onClose={() => {
                    modal.close()
                }}
            />
        })
    }

    commitQuantityLeft = async () => {
        antd.Modal.confirm({
            title: <Translation>
                {(t) => t("Are you sure you want to commit all quantity left?")}
            </Translation>,
            content: <Translation>
                {(t) => t("This will commit all quantity left and finish the production for this workload.")}
            </Translation>,
            onOk: async () => {
                const quantityLeft = this.countQuantityLeft()
                this.counter.update("stop")

                await this.submitCommit(quantityLeft, this.counter.tooks())

                this.counter.update("start")
            },
        })
    }

    submitCommit = async (quantity, tooks) => {
        quantity = quantity ?? 1

        const quantityLeft = this.countQuantityLeft()

        const makeCommit = async () => {
            await this.api.post.workorderCommit({
                workorderId: this.state.workorder._id,
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

        if (this.countQuantityLeft() === 0) {
            this.toogleRunning(false)
            this.onWorkpartFinished()
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
    }

    renderProperties = (item) => {
        if (!item.properties) {
            return false
        }

        const keys = Object.keys(item.properties).filter((key) => !excludedProperties.includes(key))

        if (keys.length <= 0) {
            return <div style={{ textAlign: "center" }}>
                <antd.Empty description={false} />
                <h2>
                    <Translation>
                        {t => t("No properties")}
                    </Translation>
                </h2>
            </div>
        }

        return keys.map((key) => {
            const PropertyRender = () => {
                const property = item.properties[key]

                if (property == null) {
                    return <antd.Tag>None</antd.Tag>
                }

                if (Array.isArray(property)) {
                    return property.map((prop) => {
                        return <antd.Tag style={{ marginBottom: "5px" }}>
                            <p>{prop}</p>
                        </antd.Tag>
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

    renderImagePreview = (item) => {
        if (Array.isArray(item.properties.imagePreview)) {
            return <Swiper>
                {item.properties.imagePreview.map((image) => {
                    return <Swiper.Item>
                        <Image src={image} fit="cover" />
                    </Swiper.Item>
                })}
            </Swiper>
        }

        return false
    }

    render() {
        if (!this.state.data || this.state.loading) {
            return <Skeleton />
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
                {this.state.data?.properties?.imagePreview && <div className="images">
                    {this.renderImagePreview(this.state.data)}
                </div>}
                <div>
                    <h1>{this.state.data.name}</h1>
                </div>
                <div>
                    <h3>#{String(this.state.data.uuid).toUpperCase()}</h3>
                </div>
            </div>

            {!this.state.assistantMode && <div className="properties">
                <div className="property">
                    <div className="name">
                        <Translation>
                            {t => t("Type")}
                        </Translation>
                    </div>
                    <div className="value">
                        <Translation>
                            {t => t(String(this.state.data.type).toTitleCase())}
                        </Translation>
                    </div>
                </div>
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
                    {this.state.running && <div>
                        <antd.Button
                            icon={<Icons.Check />}
                            disabled={quantityLeft === 0}
                            onClick={this.commitQuantityLeft}
                        >
                            <Translation>
                                {t => t("Commit all")}
                            </Translation>
                        </antd.Button>
                    </div>}
                </div>
            </div>
        </div>
    }
}