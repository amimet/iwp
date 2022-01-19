import React from "react"
import * as antd from "antd"
import { Stepper, Toast } from "antd-mobile"

import "./index.less"

export class Commit extends React.Component {
    state = {
        loading: true,
        error: null,
        data: null,
        quantity: 1,
    }

    api = window.app.request

    handleError = (err) => {
        console.error(err)
        this.setState({ error: err })
    }

    clearError = () => {
        this.setState({ error: null })
    }

    toogleLoading = (to) => {
        this.setState({ loading: to ?? !this.state.loading })
    }

    componentDidMount = async () => {
        const { workloadId, payloadUUID } = this.props

        if (!workloadId) {
            return this.handleError("No workload id provided")
        }
        if (!payloadUUID) {
            return this.handleError("No tokenUUID provided")
        }

        await this.fetchCommitTokens()
    }

    fetchCommitTokens = async () => {
        this.toogleLoading(true)

        const data = await this.api.get.workloadCommits(undefined, {
            workloadId: this.props.workloadId,
            payloadUUID: this.props.payloadUUID,
        }).catch((err) => {
            console.error(err)
            antd.message.error(`Failed to load workload: ${err}`)
            return false
        })

        if (data) {
            console.log(data)
            this.setState({ data })
            this.toogleLoading(false)
        }
    }

    onCommit = async () => {
        const result = await this.api.post.workloadCommit({
            workloadId: this.props.workloadId,
            payloadUUID: this.props.payloadUUID,
            quantity: this.state.quantity
        }).catch((error) => {
            console.error(error)
            antd.message.error(`Failed to commit: ${error}`)

            if (typeof this.props.onCommitFail === "function") {
                this.props.onCommitFail(error)
            }

            return false
        })

        if (result) {
            if (typeof this.props.onCommitDone === "function") {
                this.props.onCommitDone(result)
            }
            if (typeof this.props.close === "function") {
                this.props.close()
            }
            Toast.show({
                icon: 'success',
                content: 'Done',
            })
        }
    }

    render() {
        if (this.state.error) {
            return <antd.Result
                status="error"
                subTitle={this.state.error}
            />
        }

        if (this.state.loading) {
            return <antd.Skeleton active />
        }

        return <div className="commitStepper">
            <div className="commitStepper content">
                <div>
                    <h3>{String(this.props.payloadUUID).toUpperCase()}</h3>
                </div>
                <div>
                    <Stepper defaultValue={this.state.quantity} min={1} onChange={(value) => {
                        this.setState({ quantity: value })
                    }} />
                </div>
            </div>
            <div className="commitStepper actions">
                <div>
                    <antd.Button type="primary" onClick={this.onCommit}>
                        Commit
                    </antd.Button>
                </div>
            </div>
        </div>
    }
}

export function openModal(props) {
    window.app.DrawerController.open("Commit", Commit, {
        props: {
            width: "fit-content",
        },
        componentProps: props,
    })
}

export default Commit