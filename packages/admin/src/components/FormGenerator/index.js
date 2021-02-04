import React from 'react'
import { connect } from 'umi'
import { verbosity } from 'core/libs'

import { Form, Input, Button, Checkbox, Select, Dropdown, Slider, InputNumber, DatePicker, AutoComplete, Divider, Switch } from 'antd';
import HeadShake from 'react-reveal/HeadShake';
import * as antd from 'antd'

const formItems = { Input, Button, Checkbox, Select, Dropdown, Slider, InputNumber, DatePicker, AutoComplete, Divider, Switch }

import * as Icons from 'components/Icons'
@connect(({ app }) => ({ app }))
export default class FormGenerator extends React.Component {
    discardValuesFromID = []
    FormRef = React.createRef()

    state = {
        validating: false,
        items: this.props.items,
        shakeItem: false,
        failed: {}
    }

    handleFinish(payload) {
        if (typeof (this.props.onFinish) !== "undefined") {
            try {
                const keys = Object.keys(payload)
                this.discardValuesFromID.forEach((id) => {
                    if (keys.includes(id)) {
                        delete payload[id]
                    }
                })
            } catch (error) {
                // terrible
            }
            return this.props.onFinish(payload)
        }
        verbosity(`Cannot handleFinish cause the callback prop is not set`)
    }

    formItemShake(id) {
        this.setState({ shakeItem: id })
        setTimeout(() => {
            this.setState({ shakeItem: false })
        }, 50)
    }

    handleFormError(item, error) {
        let fails = this.state.failed

        fails[item] = error ?? true

        this.setState({ failed: fails })
        this.formItemShake(item)
    }

    handleFailChange(event) {
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
            clearErrors: () => {
                this.setState({ failed: {} })
            },
            handleFinish: () => this.FormRef.current.submit(),
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
                // if (typeof(this.props.validationTimeout) !== "number" || timeout) {
                //     setTimeout(() => {
                //         this.setState({ validating: !this.state.validating })
                //     }, this.props.validationTimeout || timeout)
                // }
                return this.state.validating
            }
        }
    }

    renderValidationIcon() {
        if (this.props.renderLoadingIcon && this.state.validating) {
            return <Icons.LoadingOutlined spin style={{ marginTop: "7px" }} />
        }
        return null
    }

    renderItems(elements) {
        const fails = this.state.failed

        let AutoIncrement = 0

        if (Array.isArray(elements)) {
            try {
                return elements.map((e) => {
                    let { id, label, title, ignore, group, formItem, formElement } = e

                    if (typeof (id) == "undefined") {
                        AutoIncrement++
                        id = `${formElement.element}_${AutoIncrement}`
                    }
                    if (typeof (formItem) == "undefined") {
                        formItem = {}
                    }
                    if (typeof (formElement) == "undefined") {
                        formElement = {}
                    }

                    if (typeof (group) !== "undefined") {
                        return <div style={{ display: "flex" }} key={id}>
                            {this.renderItems(group)}
                        </div>
                    }

                    if (typeof (formItems[formElement.element]) == "undefined") {
                        console.warn(`${formElement.element} is not available on formItems`)
                        return null
                    }

                    const failStatement = fails["all"] ? fails["all"] : fails[id]
                    const rules = formItem.rules ?? null
                    const hasFeedback = formItem.hasFeedback ?? true

                    let elementProps = {
                        disabled: this.state.validating,
                    }
                    let itemProps = {

                    }

                    if (typeof (formElement.props) !== "undefined") {
                        elementProps = { ...elementProps, ...formElement.props }
                    }
                    if (typeof (formItem.props) !== "undefined") {
                        itemProps = { ...elementProps, ...formItem.props }
                    }
                    if (typeof (ignore) !== "undefined") {
                        this.discardValuesFromID.push(id)
                    }

                    const renderElementPrefix = () => {
                        if (formElement.icon) {
                            let renderIcon = null

                            const iconType = typeof (formElement.icon)
                            switch (iconType) {
                                case "string": {
                                    if (typeof (Icons[formElement.icon]) !== "undefined") {
                                        renderIcon = React.createElement(Icons[formElement.icon])
                                    } else {
                                        verbosity("providen icon is not avialable on icons libs")
                                    }
                                    break
                                }
                                case "object": {
                                    renderIcon = formElement.icon
                                    break
                                }
                                default: {
                                    verbosity(`cannot mutate icon cause type (${iconType}) is not handled`)
                                    break
                                }
                            }
                            if (renderIcon) {
                                // try to generate icon with props 
                                return React.cloneElement(renderIcon, (formElement.iconProps ? { ...formElement.iconProps } : null))
                            }
                        } else {
                            return formItem.prefix ?? null
                        }
                    }

                    switch (formElement.element) {
                        case "Divider": {
                            this.discardValuesFromID.push(id)
                            break
                        }
                        case "Button": {
                            if (e.withValidation) {
                                elementProps.icon = this.state.validating ? <Icons.LoadingOutlined spin style={{ marginRight: "7px" }} /> : null
                            }
                            break
                        }
                        case "Input": {
                            itemProps = {
                                ...itemProps,
                                hasFeedback,
                                rules,
                                onChange: (e) => this.handleFailChange(e),
                                help: failStatement ? failStatement : null,
                                validateStatus: failStatement ? 'error' : null,
                            }
                            elementProps = {
                                ...elementProps,
                                id: id,
                                prefix: renderElementPrefix() ?? null,
                                placeholder: formElement.placeholder,
                            }
                            break
                        }
                        case "Select": {
                            if (typeof (formElement.renderItem) !== "undefined") {
                                elementProps.children = formElement.renderItem
                            }
                            if (typeof (formElement.options) !== "undefined" && !formElement.renderItem) {
                                if (!Array.isArray(formElement.options)) {
                                    console.warn(`Invalid options data type, expecting Array > recived ${typeof (formElement.options)}`)
                                    return null
                                }
                                elementProps.children = formElement.options.map((option) => {
                                    return <Select.Option key={option.id ?? Math.random} value={option.value ?? option.id}> {option.name ?? null} </Select.Option>
                                })
                            }
                            itemProps = {
                                ...itemProps,
                                hasFeedback,
                                rules,
                                validateStatus: failStatement ? 'error' : null,
                                help: failStatement ? failStatement : null,
                            }
                            break
                        }
                        default: {
                            itemProps = {
                                ...itemProps,
                                hasFeedback,
                                rules,
                                validateStatus: failStatement ? 'error' : null,
                                help: failStatement ? failStatement : null,
                            }
                            break
                        }
                    }

                    return <div style={{ margin: "auto", width: "100%", padding: "0 10px" }} key={id}>
                        {title ?? null}
                        <HeadShake spy={this.shouldShakeItem(id)}>
                            <Form.Item label={label} name={id} key={id} {...itemProps}>
                                {React.createElement(formItems[formElement.element], elementProps)}
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
        const helpStatus = this.state.failed["all"] ? (this.state.failed["all"] ?? null) : (this.state.failed["result"] ?? null)
        const validateStatus = this.state.failed["all"] ? (this.state.failed["all"] ? "error" : null) : (this.state.failed["result"] ? 'error' : null)
        if (!this.state.items) {
            verbosity(`Nothing to render`)
            return null
        }
        return <div>
            <Form
                hideRequiredMark={this.props.hideRequiredMark ?? false}
                name={this.props.name ?? "new_form"}
                onFinish={(e) => this.handleFinish(e)}
                ref={this.FormRef}
                {...this.props.formProps}
            >
                {this.renderItems(this.state.items)}
                <Form.Item
                    key="result"
                    help={helpStatus}
                    validateStatus={validateStatus}
                />
            </Form>
            {this.renderValidationIcon()}
        </div>
    }
}