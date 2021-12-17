import React from "react"
import * as antd from "antd"
import { Icons, createIconRender } from "components/Icons"
import FORMULAS from "schemas/fabricFormulas"

import "./index.less"

export default class Inspector extends React.Component {
    componentDidMount = async () => {
        console.log(this.props.item)
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
        if (!this.props.item) {
            console.error("No item provided")
            return null
        }

        const formula = FORMULAS[this.props.item.type]

        return <div className="fabric_inspector">
            <div className="fabric_inspector header">
                <h3>#{this.props.item.uuid ?? "deserialized"}</h3>
                <div className="fabric_inspector header title">
                    <div>
                        <h1>{Icons[formula.icon] && createIconRender(formula.icon)}{this.props.item.name}</h1>
                    </div>
                    <div className="fabric_inspector quantity">x{this.props.item.quantity}</div>
                </div>
                <h3>{this.props.item.properties?.description}</h3>
            </div>

            <div className="fabric_inspector properties">
                {this.renderProperties(this.props.item)}
            </div>

            <div className="fabric_inspector actions">
                <div>
                    <antd.Button type="primary" icon={<Icons.MdOutlinePendingActions />}>
                        Run
                    </antd.Button>
                </div>
                <div>
                    <antd.Button icon={<Icons.Edit />}>
                        Edit
                    </antd.Button>
                </div>
                <div>
                    <antd.Button icon={<Icons.CheckCircle />}>
                        Mark as done
                    </antd.Button>
                </div>
            </div>
        </div>
    }
}