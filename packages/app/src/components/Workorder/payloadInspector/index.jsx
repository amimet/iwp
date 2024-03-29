import React from "react"
import * as antd from "antd"
import { Modal, Toast } from "antd-mobile"
import { Translation } from "react-i18next"
import classnames from "classnames"
import moment from "moment"

import { User } from "models"
import { QuantityInput, Skeleton, ImageViewer } from "components"
import { Icons } from "components/Icons"
import { useLongPress, Haptics } from "utils"

import FORMULAS from "schemas/fabricFormulas"

import "./index.less"

const excludedProperties = ["images", "imagePreview", "quantity"]

const Worker = (props) => {
    if (!props.worker) {
        return <div>
            <h2>
                <Translation>
                    {t => t("No data available")}
                </Translation>
            </h2>
        </div>
    }
    const { fullName, username, avatar } = props.worker ?? {}

    return <div className="worker">
        <div>
            <antd.Avatar src={avatar} />
        </div>
        <div>
            <antd.Badge
                count={props.self ? "You" : 0}
                offset={[20, 0]}
            >
                <h2>{fullName ?? username}</h2>
            </antd.Badge>
        </div>
    </div>
}

const SpentTimer = (props = {}) => {
    const [time, setTime] = React.useState(0)

    // update every second with the difference between now and the start time
    React.useEffect(() => {
        const interval = setInterval(() => {
            const now = moment()
            const diff = now.diff(props.startTime)
            setTime(diff)
        }, 1000)

        return () => clearInterval(interval)
    }, [props.startTime])


    return <div className="spentTimer">
        <div className="spent">
            <Icons.Clock />
            {time === 0 ? <Translation>
                {t => t("Calculating...")}
            </Translation> : moment.utc(time).format("HH:mm:ss")}
        </div>
    </div>
}

const AssistantActions = (props = {}) => {
    const [loading, setLoading] = React.useState(false)
    const [stepHold, setStepHold] = React.useState(false)
    const [runningHold, setRunningHold] = React.useState(false)

    const handleRunning = async (to) => {
        if (props.disabled) {
            return false
        }

        to = to ?? !props.running

        if (typeof props.onToogleRunning === "function") {
            await props.onToogleRunning(to)
        }
    }

    const handleMakeStep = async () => {
        if (props.disabled) {
            return false
        }

        if (typeof props.onMakeStep === "function") {
            await props.onMakeStep()
        }
    }

    const handleOpenManualInput = () => {
        if (typeof props.onOpenManualInput === "function") {
            props.onOpenManualInput()
        }
    }

    const holdRunningDelay = 1000
    const holdStepDelay = 500

    const RunningButton = <antd.Button
        type="primary"
        size="large"
        loading={loading}
        disabled={loading || props.disabled}
        icon={props.running ? <Icons.Pause /> : <Icons.Clock />}
        className={classnames(
            "holdButton",
            {
                ["disabled"]: props.disabled,
                ["holding"]: runningHold,
                [`duration${holdRunningDelay}`]: runningHold,
            },
        )}
        {...useLongPress(
            async () => {
                if (props.disabled) {
                    return false
                }

                setRunningHold(false)

                setLoading(true)
                await handleRunning()
                setLoading(false)
            },
            () => {
                if (props.disabled) {
                    return false
                }

                Toast.show({
                    type: "info",
                    content: <Translation>
                        {t => t("Press and hold for 2 seconds to toogle running")}
                    </Translation>,
                    duration: 2000,
                })
            },
            {
                shouldPreventDefault: true,
                delay: holdRunningDelay,
                onTouchStart: () => {
                    if (props.disabled) {
                        return false
                    }

                    setRunningHold(true)
                },
                onTouchEnd: () => {
                    if (props.disabled) {
                        return false
                    }

                    setRunningHold(false)
                }
            }
        )}
    >
        <span>
            <Translation>
                {t => t(props.running ? "Stop" : "Start")}
            </Translation>
        </span>
    </antd.Button>

    const StepButton = <antd.Button
        size="large"
        icon={<Icons.Plus />}
        loading={loading}
        disabled={loading || props.disabled}
        className={classnames(
            "holdButton",
            {
                ["disabled"]: props.disabled,
                ["holding"]: stepHold,
            },
            `duration${holdStepDelay}`,
        )}
        {...useLongPress(
            () => {
                handleMakeStep()
                setStepHold(false)
            },
            () => {

            },
            {
                shouldPreventDefault: true,
                delay: holdStepDelay,
                onTouchStart: () => {
                    if (props.disabled) {
                        return false
                    }

                    setStepHold(true)
                },
                onTouchEnd: () => {
                    if (props.disabled) {
                        return false
                    }

                    setStepHold(false)
                }
            }
        )}
    >
        <span>
            1
        </span>
    </antd.Button>

    const CustomTokenButton = <antd.Button
        icon={<Icons.MdGeneratingTokens />}
    >
        <span>
            <Translation>
                {t => t("Add others")}
            </Translation>
        </span>
    </antd.Button>

    return <div className="assistant">
        {props.running && props.startTime && <SpentTimer startTime={props.startTime} />}
        <div className={classnames("controls", { ["running"]: props.running })}>
            <div>
                {RunningButton}
            </div>
            {props.running && <div>
                {StepButton}
            </div>}
            {(props.running || props.disabled) && <div>
                <antd.Button
                    size="large"
                    onClick={handleOpenManualInput}
                >
                    <Translation>
                        {t => t("Mark quantity")}
                    </Translation>
                </antd.Button>
            </div>}
        </div>
        {props.running && <div>
            {CustomTokenButton}
        </div>}
    </div>
}

export default class Inspector extends React.Component {
    state = {
        loading: true,
        workorder: null,
        data: null,
        running: false,
        activeWorkers: [],
        currentSpentTime: 0,
    }

    api = window.app.request
    WSRequest = window.app.wsRequest

    componentDidMount = async () => {
        this.uuid = this.props.payload?.uuid ?? this.props.uuid
        this.selfUserId = await User.selfUserId()

        if (!this.uuid) {
            console.error("No UUID provided")
            return false
        }

        await this.fetchWorkorderDataWithUUID()

        if (this.props.payload) {
            await this.setState({ data: this.props.payload })
        } else {
            const data = this.state.workorder.payloads.find((payload) => payload.uuid === this.uuid)
            await this.setState({ data })
        }

        // set active workers 
        const activeTasks = await this.fetchActiveTasks()

        await this.setState({ activeWorkers: activeTasks })

        // detect if you are in active workers
        const activeTask = activeTasks.find((task) => task.user_id === this.selfUserId)

        if (activeTask) {
            await this.setState({ running: true, activeTask: activeTask })
        }

        // update current spent time
        await this.updateCurrentSpentTime()

        // declare websocket events
        window.app.ws.listen(`newCommit_${this.uuid}`, (data) => {
            let workorder = this.state.workorder

            if (!workorder.commits) {
                workorder.commits = []
            }

            workorder.commits.push(data.commit)

            this.setState({ workorder })
        })

        window.app.ws.listen(`task.join.target.${this.uuid}`, (data) => {
            let activeWorkers = this.state.activeWorkers

            activeWorkers.push(data)

            this.setState({ activeWorkers })
        })

        window.app.ws.listen(`task.leave.target.${this.uuid}`, (data) => {
            let activeWorkers = this.state.activeWorkers

            activeWorkers = activeWorkers.filter((worker) => worker.user_id !== data.user_id)

            this.setState({ activeWorkers })
        })

        window.app.ws.listen(`workorderFinished_${typeof this.state.workorder._id === "object" ? this.state.workorder._id.toString() : this.state.workorder._id}`, async () => {
            await this.toogleRunning(false)
        })

        this.props.events.on("beforeClose", () => {
            if (this.state.running) {
                Toast.show({
                    type: "info",
                    content: <Translation>
                        {t => t("Task remains opened, dont forget to stop it when you are done")}
                    </Translation>,
                    duration: 3000,
                })
            }
        })

        this.toogleLoading(false)
    }

    updateCurrentSpentTime = async () => {
        const spentTime = await this.fetchCurrentSpentTime()

        await this.setState({ currentSpentTime: spentTime.seconds })
    }

    fetchCurrentSpentTime = async () => {
        const result = await this.api.get.timeSpent(undefined, {
            target_id: this.uuid,
            user_id: this.selfUserId,
        }).catch(() => {
            return false
        })

        return result
    }

    fetchActiveTasks = async () => {
        const result = await this.api.get.activeTasks(undefined, {
            target_id: this.uuid,
        }).catch((err) => {
            console.error(err)
            return false
        })

        return result
    }

    fetchWorkorderDataWithUUID = async () => {
        const data = await this.api.get.workorderPayloadUuid(undefined, { uuid: this.uuid }).catch((err) => {
            console.error(err)
            antd.message.error(`Failed to load workorder: ${err}`)
            return false
        })

        if (data) {
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
        return new Promise(async (resolve, reject) => {
            to = to ?? !this.state.running

            await this.WSRequest[to ? "join_task" : "leave_task"]({
                target_id: this.uuid,
            })
                .then(async (data) => {
                    Haptics.impact("Medium")

                    await this.updateCurrentSpentTime()
                    await this.setState({ running: to, activeTask: data })

                    return resolve()
                })
                .catch((err) => {
                    console.error(err)

                    Toast.show({
                        icon: "fail",
                        content: `Failed to ${to ? "join" : "leave"} workload: ${err.message}`,
                    })

                    return resolve()
                })
        })
    }

    manualQuantityPicker = async () => {
        const modal = Modal.show({
            title: <Translation>
                {(t) => t("Mark produced quantity")}
            </Translation>,
            content: <QuantityInput
                fullFillQuantity={this.countQuantityLeft()}
                onOk={async (value) => {
                    if (value > 0) {
                        await this.submitCommit(value)
                        modal.close()
                    }
                }}
                onClose={() => {
                    modal.close()
                }}
            />,
        })
    }

    submitCommit = async (quantity) => {
        quantity = quantity ?? 1

        const quantityLeft = this.countQuantityLeft()

        const makeCommit = async () => {
            const commit = await this.WSRequest.payloadCommit({
                workorderId: this.state.workorder._id,
                payloadUUID: this.uuid,
                quantity,
            }).catch((error) => {
                console.error(error)

                Toast.show({
                    icon: "fail",
                    content: "Failed to commit",
                })

                return false
            })

            if (commit) {
                Haptics.impact("Heavy")

                Toast.show({
                    icon: "success",
                    content: "Commit successful",
                })
            }
        }

        if (quantityLeft <= 0) {
            await antd.Modal.confirm({
                title: <Translation>
                    {(t) => t("Production quantity already has been reached")}
                </Translation>,
                content: <Translation>
                    {(t) => t("Are you sure you want to commit for this workorder?")}
                </Translation>,
                onOk: async () => {
                    return await makeCommit()
                },
            })
        } else {
            await makeCommit()
        }

        if (this.countQuantityLeft() === 0 && !this.state.workorder.finished) {
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

        await this.submitCommit(1)
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
                {this.state.data?.properties?.images && <ImageViewer src={this.state.data?.properties?.images} />}
                <div>
                    <h1>{this.state.data.name}</h1>
                </div>
                <div>
                    <h3>#{String(this.state.data.uuid).toUpperCase()}</h3>
                </div>
            </div>

            <div className="card">
                {this.renderProperties(this.state.data)}

                <div className="property">
                    <div className="name">
                        <Translation>
                            {t => t("Your spent time")}
                        </Translation>
                    </div>
                    <div className="value">
                        {
                            this.state.currentSpentTime ? moment.duration(this.state.currentSpentTime, "seconds").humanize() : "-"
                        }
                    </div>
                </div>
            </div>

            <div className="card">
                <div>
                    <antd.Badge offset={[16, 6]} count={this.state.activeWorkers?.length}>
                        <h3>
                            <Icons.Users />
                            <Translation>
                                {t => t("Workers")}
                            </Translation>
                        </h3>
                    </antd.Badge>
                </div>
                <div>
                    {
                        this.state.activeWorkers?.length > 0 ?
                            this.state.activeWorkers?.map((worker) => {
                                return <Worker worker={worker.user_data} self={worker.user_id === this.selfUserId} />
                            }) :
                            <antd.Empty description={<Translation>
                                {t => t("No workers")}
                            </Translation>} />
                    }
                </div>
            </div>

            <div className="float">
                <div className="card primary">
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
                </div>

                <AssistantActions
                    running={this.state.running}
                    disabled={quantityLeft === 0}
                    onMakeStep={this.onMakeStep}
                    onOpenManualInput={this.manualQuantityPicker}
                    onToogleRunning={this.toogleRunning}
                    startTime={this.state.activeTask?.start}
                />
            </div>
        </div>
    }
}