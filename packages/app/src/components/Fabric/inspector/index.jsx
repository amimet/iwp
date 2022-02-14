import React from "react"
import * as antd from "antd"
import { Translation } from "react-i18next"

import { User } from "models"
import { Skeleton, ActionsBar, ImageViewer } from "components"
import { Icons } from "components/Icons"

import "./index.less"

const excludedProperties = ["imagePreview"]

export default class Inspector extends React.Component {
    state = {
        loading: true,
        data: null,
        hasManager: false,
    }

    api = window.app.request

    componentDidMount = async () => {
        this.id = this.props.payload?.id ?? this.props.id

        if (!this.id) {
            console.error("No ID provided")
            return false
        }
        
        await this.setState({ hasManager: await User.hasRole("manager") })
        await this.fetchFabricObjectData()
    }

    fetchFabricObjectData = async () => {
        await this.setState({ loading: true })

        const result = await this.api.get.fabricById(undefined, { _id: this.id }).catch((error) => {
            console.error(error)
            antd.message.error(error.message)
            return false
        })

        if (result) {
            await this.setState({ data: result, loading: false })
        }
    }

    onClickEdit = () => {
        window.app.openFabricEditor(this.id, (result) => {
            if (result) {
                this.setState({ data: result })
            }
        })
    }

    onClickHelp = () => {
        // TODO: Implement
        antd.message.info("This function is not implemented yet")
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

        return <div className="inspector">
            <div className="header">
                {this.state.data?.properties?.imagePreview && <ImageViewer src={this.state.data?.properties?.imagePreview} />}
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
                {this.state.hasManager &&
                    <antd.Button
                        icon={<Icons.Edit />}
                        onClick={this.onClickEdit}
                    >
                        <Translation>
                            {t => t("Edit")}
                        </Translation>
                    </antd.Button>
                }

                <antd.Button
                    icon={<Icons.HelpCircle />}
                    onClick={this.onClickHelp}
                >
                    <Translation>
                        {t => t("Help")}
                    </Translation>
                </antd.Button>
            </ActionsBar>
        </div>
    }
}