import React from "react"
import * as antd from "antd"
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
                <div className="fabric_inspector properties property" key={key}>
                    <div className="fabric_inspector properties property name">{String(key).toTitleCase()}</div>
                    <div className="fabric_inspector properties property value"><PropertyRender /></div>
                </div>
            )
        })
    }

    render() {
        if (!this.state.data) {
            return <antd.Skeleton active />
        }

        const formula = FORMULAS[this.state.data.type]

        return <div className="fabric_inspector">
            <div className="fabric_inspector header">
                <h3>#{this.state.data.uuid ?? this.state.data._id ?? "deserialized"}</h3>
                <div className="fabric_inspector header title">
                    <div>
                        <h1>{Icons[formula.icon] && createIconRender(formula.icon)}{this.state.data.name}</h1>
                    </div>
                    {this.state.data.quantity && <div className="fabric_inspector quantity">x{this.state.data.quantity}</div>}
                </div>
                <h3>{this.state.data.properties?.description}</h3>
            </div>

            <div className="fabric_inspector properties">
                {this.renderProperties(this.state.data)}
            </div>

            <div className="fabric_inspector actions">
                {this.props.runnable && <div>
                    <antd.Button type="primary" icon={<Icons.MdOutlinePendingActions />}>
                        Run
                    </antd.Button>
                </div>}
                <div>
                    <antd.Button icon={<Icons.Edit />}>
                        Edit
                    </antd.Button>
                </div>
                {this.props.resolvable && <div>
                    <antd.Button icon={<Icons.CheckCircle />}>
                        Mark as done
                    </antd.Button>
                </div>}
            </div>
        </div>
    }
}