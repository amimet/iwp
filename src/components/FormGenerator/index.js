import React from 'react'
import { connect } from 'umi'
import { verbosity } from 'core/libs'

import { Form, Input, Button, Checkbox } from 'antd';
import HeadShake from 'react-reveal/HeadShake';
import * as antd from 'antd'

import * as Icons from 'components/Icons'

@connect(({ app }) => ({ app }))
export default class FormGenerator extends React.Component {
    state = {
        validating: false,
        items: this.props.items,
        shakeItem: false,
        failed: {}
    }

    FormRef = React.createRef()

    handleFinish(payload) {
        if (typeof (this.props.onFinish) !== "undefined") {
            return this.props.onFinish(payload)
        }
        verbosity(`Cannot handleFinish cause the callback prop is not set`)
    }

    componentDidMount() {
        if (!this.props.items) {
            verbosity(`items not provided, nothing to render`)
            return null
        }
        // set handlers to current window
        if (typeof (window.currentForms) == "undefined") {
            window.currentForms = {}
        }

        window.currentForms[`${this.props.name ?? this.props.id}`] = {
            handleFormError: (id, error) => {
                this.handleFormError(id, error)
            },
            formItemShake: (id) => {
                this.formItemShake(id)
            },
            toogleValidation: (to) => {
                if (typeof (to) !== "undefined") {
                    return this.setState({ validating: to })
                }
                this.setState({ validating: !this.state.validating })
                return this.state.validating
            }
        }
    }

    handleFormError(item, error) {
        let fails = this.state.failed

        fails[item] = error ?? true

        this.setState({ failed: fails })
        this.formItemShake(item)
    }

    handleItemChange(event) {
        const itemID = event.target.id
        if (itemID) {
            let fails = this.state.failed

            if (fails["all"]) {
                fails["all"] = false
                this.setState({ failed: fails })
            }

            if (fails[itemID]) {
                // try desactivate failed statement
                fails[itemID] = false
                this.setState({ failed: fails })
            }

        }
    }

    shouldShakeItem(id) {
        try {
            const mutation = false
            if (this.state.shakeItem === "all") {
                return mutation
            }
            if (this.state.shakeItem == id) {
                return mutation
            }
        } catch (error) {
            // not returning
        }
    }

    formItemShake(id) {
        this.setState({ shakeItem: id })
        setTimeout(() => {
            this.setState({ shakeItem: false })
        }, 50)
    }

    renderItems() {
        const fails = this.state.failed
        const elements = this.state.items

        if (Array.isArray(elements)) {
            try {
                const formItemsToMap = {
                    "Input": antd.Input,
                    "Button": antd.Button
                }

                return elements.map((e) => {
                    let elementProps = null
                    let itemProps = null

                    const FormID = e.id ?? "new_formitem"
                    const failStatement = fails["all"] ? fails["all"] : fails[FormID]

                    const form = e.form ?? {}
                    const type = e.type ?? {}

                    const itemElementPrefix = () => {
                        if (type.icon) {
                            let renderIcon = null

                            const iconType = typeof (type.icon)
                            switch (iconType) {
                                case "string": {
                                    if (typeof (Icons[type.icon]) !== "undefined") {
                                        renderIcon = React.createElement(Icons[type.icon])
                                    } else {
                                        verbosity("providen icon is not avialable on icons libs")
                                    }
                                    break
                                }
                                case "object": {
                                    renderIcon = type.icon
                                    break
                                }
                                default: {
                                    verbosity(`cannot mutate icon cause type (${iconType}) is not handled`)
                                    break
                                }
                            }

                            if (renderIcon) {
                                // try to generate icon with props 
                                return React.cloneElement(renderIcon, (type.iconProps ? { ...type.iconProps } : null))
                            }

                        } else {
                            return type.prefix ?? null
                        }

                    }

                    const rules = form.rules ?? null
                    const hasFeedback = form.hasFeedback ?? true

                    switch (type.element) {
                        case "Button": {
                            if (typeof (type.props) !== "undefined") {
                                elementProps = type.props

                            }
                            if (e.withValidation) {
                                elementProps.icon = this.state.validating ? <Icons.LoadingOutlined spin style={{ marginRight: "7px" }} /> : null
                                elementProps.disabled = this.state.validating
                            }
                            break
                        }
                        case "Input": {
                            itemProps = {
                                name: FormID,
                                hasFeedback,
                                rules,
                                onChange: (e) => this.handleItemChange(e),
                                help: failStatement ? failStatement : null,
                                validateStatus: failStatement ? 'error' : null,
                                ...form.props
                            }
                            elementProps = {
                                id: FormID,
                                prefix: itemElementPrefix() ?? null,
                                placeholder: type.placeholder,
                                ...type.props
                            }
                            break
                        }
                        default:
                            break;
                    }

                    return <div key={FormID}>
                        <HeadShake spy={this.shouldShakeItem(FormID)}>
                            <Form.Item {...itemProps}>
                                {React.createElement(formItemsToMap[type.element], elementProps)}
                            </Form.Item>
                        </HeadShake>
                    </div>
                })
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    render() {
        if (!this.state.items) {
            verbosity(`Nothing to render`)
            return null
        }
        return <Form
            name={this.props.name ?? "new_form"}
            onFinish={(e) => this.handleFinish(e)}
            ref={this.FormRef}
            {...this.props.extraProps}
        >
            {this.renderItems()}
            <Form.Item
                name="result"
                help={this.state.failed["result"] ? this.state.failed["result"] : null}
                validateStatus={this.state.failed["result"] ? 'error' : null}
            />
        </Form>
    }
}