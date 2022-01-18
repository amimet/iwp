import React from "react"
import * as antd from "antd"
import loadable from "@loadable/component"

import { Icons, createIconRender } from "components/Icons"
import { ActionsBar } from "components"

import "./index.less"

export default class StepsForm extends React.Component {
    state = {
        steps: [...(this.props.steps ?? []), ...(this.props.children ?? [])],

        step: 0,
        values: {},
        canNext: false,
        renderStep: null,
    }

    api = window.app.request

    componentDidMount = async () => {
        this.nextStep(0)
    }

    nextStep = (to) => {
        const index = to ?? (this.state.step + 1)

        this.setState({ step: index, renderStep: this.renderStep(index) })
    }

    prevStep = () => {
        this.nextStep(this.state.step - 1)
    }

    handleError = (error) => {
        this.setState({ submitting: false, submittingError: error })
    }

    handleUpdate = (key, value) => {
        this.setState({ values: { ...this.state.values, [key]: value } }, () => {
            if (typeof this.props.onChange === "function") {
                this.props.onChange(this.state.values)
            }
        })
    }

    handleValidation = (result) => {
        this.setState({ canNext: result })
    }

    canSubmit = () => {
        if (typeof this.props.canSubmit === "function") {
            return this.props.canSubmit(this.state.values)
        }

        return true
    }

    onSubmit = async () => {
        if (typeof this.props.onSubmit === "function") {
            this.setState({ submitting: true, submittingError: null })

            await this.props.onSubmit(this.state.values).catch((error) => {
                console.error(error)
                this.handleError(error)
            })
        }
    }

    renderStep = (stepIndex) => {
        const step = this.state.steps[stepIndex]

        let content = step.content
        let value = this.state.values[step.key]

        if (typeof step.key === "undefined") {
            console.error("[StepsForm] step.key is required")
            return null
        }

        if (typeof value !== "undefined" && typeof step.stateValidation === "function") {
            const validationResult = step.stateValidation(value)
            this.handleValidation(validationResult)
        }

        const componentProps = {
            handleUpdate: (to) => {
                value = to

                if (typeof step.onUpdateValue === "function") {
                    value = step.onUpdateValue(value, to)
                }

                let validationResult = true

                if (typeof step.stateValidation === "function") {
                    validationResult = step.stateValidation(to)
                }

                this.handleUpdate(step.key, to)
                this.handleValidation(validationResult)
            },
            handleError: (error) => {
                if (typeof props.handleError === "function") {
                    this.handleError(error)
                }
            },
            value: value,
        }

        if (typeof step.content === "function") {
            content = loadable(async () => {
                try {
                    const component = React.createElement(step.content, componentProps)
                    return () => component
                } catch (error) {
                    console.log(error)

                    antd.notification.error({
                        message: "Error",
                        description: "Error loading step content",
                    })

                    return () => <div>
                        <Icons.XCircle /> Error
                    </div>
                }
            }, {
                fallback: <div>Loading...</div>,
            })
        }

        return React.createElement(React.memo(content), componentProps)
    }

    render() {
        if (this.state.steps.length === 0) {
            return null
        }

        const steps = this.state.steps
        const current = steps[this.state.step]

        return (
            <div className="steps_form">
                <div className="steps_form steps">
                    <antd.Steps responsive={false} direction="horizontal" className="steps_form steps header" size="small" current={this.state.step}>
                        {steps.map(item => (
                            <antd.Steps.Step key={item.title} />
                        ))}
                    </antd.Steps>

                    <div className="steps_form steps step">
                        <h1>{current.icon && createIconRender(current.icon)}{current.title}</h1>
                        {this.state.renderStep}
                    </div>
                </div>

                {this.state.submittingError && (
                    <div style={{ color: "#f5222d" }}>
                        {String(this.state.submittingError)}
                    </div>
                )}

                <ActionsBar mode="float">
                    {this.state.step > 0 && (
                        <antd.Button style={{ margin: "0 8px" }} onClick={() => this.prevStep()}>
                            <Icons.ChevronLeft />Previous
                        </antd.Button>
                    )}
                    {this.state.step < steps.length - 1 && (
                        <antd.Button disabled={!this.state.canNext} type="primary" onClick={() => this.nextStep()}>
                            <Icons.ChevronRight />Next
                        </antd.Button>
                    )}
                    {this.state.step === steps.length - 1 && (
                        <antd.Button disabled={this.state.submitting || !this.canSubmit()} type="primary" onClick={this.onSubmit}>
                            {this.state.submitting && <Icons.LoadingOutlined spin />}
                            Done
                        </antd.Button>
                    )}
                </ActionsBar>
            </div>
        )
    }
}