import React from "react"
import * as antd from "antd"
import { Modal, Stepper } from "antd-mobile"

import { Icons, createIconRender } from "components/Icons"
import FORMULAS from "schemas/fabricFormulas"

import "./index.less"

export default class Inspector extends React.Component {
    state = {
        data: null,
    }

    api = window.app.request

    componentDidMount = async () => {
        if (this.props.item) {
            return await this.setState({ data: this.props.item })
        }
        if (this.props.id) {
            return await this.fetchData(this.props.id)
        }
    }

    fetchData = async (_id) => {
        const data = await this.api.get.fabricById(undefined, {
            _id
        }).catch((err) => {
            console.error(err)
            antd.message.error(`Failed to load fabric item: ${err}`)
            return false
        })

        if (data) {
            console.log(data)
            return this.setState({ data })
        }
    }

    getCommitsLeft = () => {
        const { data } = this.state

        if (!data.properties.quantity) {
            return null
        }

        const commitsLength = (data.commits?.length ?? 0)

        return (data.properties.quantity - commitsLength)
    }

    onClickCommit = async () => {
        const commitsLeft = this.getCommitsLeft()

        const commitModal = Modal.show({
            content: <div className="commitStepper">
                <h1>Select quantity</h1>
                <div className="commitStepper content">
                    <div>
                        <h3>{commitsLeft ?? '∞'} commits left</h3>
                    </div>
                    <div>
                        <Stepper defaultValue={1} min={1} max={commitsLeft} />
                    </div>
                    <div>

                    </div>
                </div>
                <div className="commitStepper actions">
                    <div>
                        <antd.Button type="primary" onClick={this.onCommit}>
                            Commit
                        </antd.Button>
                    </div>
                    <div>
                        <antd.Button onClick={() => commitModal.close()}>
                            Cancel
                        </antd.Button>
                    </div>
                </div>
            </div>
        })
    }

    renderProperties = (item) => {
        if (!item.properties) {
            return null
        }

        return Object.keys(item.properties).map(key => {
            const PropertyRender = () => {
                const property = item.properties[key]

                if (Array.isArray(property)) {
                    return property.map(prop => {
                        return <antd.Tag style={{ marginBottom: "5px" }}>{prop}</antd.Tag>
                    })
                }

                return property
            }

            return (
                <div className="order_inspector properties property" key={key}>
                    <div className="order_inspector properties property name">{String(key).toTitleCase()}</div>
                    <div className="order_inspector properties property value"><PropertyRender /></div>
                </div>
            )
        })
    }

    render() {
        if (!this.state.data) {
            return <antd.Skeleton active />
        }

        const formula = FORMULAS[this.state.data.type]

        return <div className="order_inspector">
            <div className="order_inspector header">
                <h3>#{this.state.data.uuid ?? this.state.data._id ?? "deserialized"}</h3>
                <div className="order_inspector header title">
                    <div>
                        <h1>{Icons[formula.icon] && createIconRender(formula.icon)}{this.state.data.name}</h1>
                    </div>
                    {this.state.data.quantity && <div className="order_inspector quantity">x{this.state.data.quantity}</div>}
                </div>
                <h3>{this.state.data.properties?.description}</h3>
            </div>

            <div className="order_inspector properties">
                {this.renderProperties(this.state.data)}
            </div>

            <div className="order_inspector actions">
                {this.props.runnable && <div>
                    <antd.Button type="primary" icon={<Icons.MdOutlinePendingActions />}>
                        Run
                    </antd.Button>
                </div>}
                {this.props.resolvable && <div>
                    <antd.Button onClick={this.onClickCommit} icon={<Icons.CheckCircle />}>
                        Commit
                    </antd.Button>
                </div>}
                <div>
                    <antd.Button icon={<Icons.Edit />}>
                        Edit
                    </antd.Button>
                </div>
            </div>
        </div>
    }
}