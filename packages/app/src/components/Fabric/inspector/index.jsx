import React from "react"
import * as antd from "antd"
import { Translation } from "react-i18next"

import { Icons } from "components/Icons"
import { Skeleton, ActionsBar } from "components"

import "./index.less"

export default class Inspector extends React.Component {
    state = {
        loading: true,
        data: null,
    }

    api = window.app.request

    componentDidMount = async () => {
        this.id = this.props.payload?.id ?? this.props.id

        if (!this.id) {
            console.error("No ID provided")
            return false
        }

        await this.fetchFabricObjectData()
    }

    fetchFabricObjectData = async () => {
        await this.setState({ loading: true })

        const result = await this.api.get.fabricById(undefined, { _id: this.id }).catch((error) => {
            console.error(error)
            antd.message.error(error.message)
            return false
        })

        console.log(result)

        if (result) {
            await this.setState({ data: result, loading: false })
        }
    }

    onClickEdit = () => {
        // TODO: Open fabric modify mode
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
            return <Skeleton />
        }

        return <div className="inspector">
            <div className="header">
                <div>
                    <h1>{this.state.data.name}</h1>
                </div>
                <div>
                    <h3>#{String(this.id).toUpperCase()}</h3>
                </div>
            </div>

            <div className="properties">
                {this.renderProperties(this.state.data)}
            </div>
            <ActionsBar float spaced>
                <div>
                    <antd.Button
                        icon={<Icons.Edit />}
                        onClick={() => this.onClickEdit}
                    >
                        <Translation>
                            {t => t("Edit")}
                        </Translation>
                    </antd.Button>
                </div>
            </ActionsBar>
        </div>
    }
}