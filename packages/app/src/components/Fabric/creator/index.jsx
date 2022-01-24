import React from "react"
import * as antd from "antd"
import { Stepper } from "antd-mobile"
import { Icons, createIconRender } from "components/Icons"
import loadable from "@loadable/component"
import classnames from "classnames"

import FORMULAS from "schemas/fabricFormulas"
import FIELDS from "schemas/fabricFields"

import "./index.less"

const FieldsComponents = {
    "input": antd.Input,
    "addableSelectList": loadable(() => import("components/AddableSelectList")),
    "textarea": antd.Input.TextArea,
    "select": antd.Select,
    "datepicker": antd.DatePicker,
    "inputNumber": Stepper,
}

export default class FabricCreator extends React.Component {
    state = {
        submitToCatalog: this.props.submitToCatalog ?? false,
        loading: true,
        submitting: false,
        error: null,

        name: null,
        type: null,
        fields: [],
        values: {},
    }

    api = window.app.request

    componentDidMount = async () => {
        await this.loadType(this.props.defaultType ?? "product")
        this.toogleLoading(false)
    }

    //* GETTERS METHODS
    getFormula = (type) => {
        // TODO: Try to fetch from the server
        return FORMULAS[type]
    }

    getField = (type) => {
        // TODO: Try to fetch from the server
        return FIELDS[type]
    }

    getCurrentFieldsState = () => {
        return this.state.fields.map((field) => {
            return {
                id: field.props.id,
                type: field.props.type,
                value: this.state.values[field.key],
            }
        })
    }

    getKeyFromLatestFieldType = (type) => {
        let latestByType = 0

        this.state.fields.forEach((field) => {
            field.props.type === type ? latestByType++ : null
        })

        return `${type}-${latestByType}`
    }

    //* HELPERS METHODS
    toogleLoading = (to) => {
        this.setState({ loading: to ?? !this.state.loading })
    }

    toogleSubmitting = (to) => {
        this.setState({ submitting: to ?? !this.state.submitting })
    }

    clearError = () => {
        if (this.state.error != null) {
            this.setState({ error: null })
        }
    }

    clearValues = async () => {
        await this.setState({ values: {} })
    }

    clearFields = async () => {
        await this.setState({ fields: [] })
    }

    clearAll = async () => {
        await this.clearError()
        await this.clearValues()
        await this.clearFields()
    }

    existsTypeOnCurrentFields = (key) => {
        return Boolean(this.state.fields.find((field) => field.props.type === key))
    }

    removeField = (key) => {
        let values = this.state.values
        let fields = this.state.fields.filter(field => field.key != key)

        delete values[key]

        this.setState({ fields: fields, values: values })
    }

    //* ON EVENTS METHODS
    onChangeName = (event) => {
        this.setState({ name: event.target.value })
    }

    onUpdateValue = (event, value) => {
        const { updateEvent, key } = event

        let state = this.state
        state.values[key] = value

        this.setState(state)
    }

    onChangeCatalogMode = (to) => {
        this.setState({ submitToCatalog: to.target.checked })
    }

    //* MAIN METHODS
    loadType = async (type) => {
        const formula = this.getFormula(type)

        await this.clearAll()

        if (formula) {
            // load default fields
            if (formula.defaultFields) {
                formula.defaultFields.forEach(field => {
                    this.appendFieldByType(field)
                })
            }
        } else {
            antd.notification.warning({
                message: "Missing formula",
                description: "The type you selected cant be found in the formulas. No defaults fields will be added.",
            })

            console.error(`[MISSING_FORMULA] Cannot load default fields from formula with type ${type}`)
        }

        await this.setState({ type: type })
    }

    appendFieldByType = (type) => {
        const field = this.getField(type)

        if (typeof field === "undefined") {
            antd.notification.warning({
                message: "Missing field",
                description: `The field you selected can"t be found in the fields. No field will be added.`,
            })
            console.error(`No form available for field [${type}]`)
            return null
        }

        const currentFields = this.state.fields

        if (this.existsTypeOnCurrentFields(type) && !field.allowMultiple) {
            console.error(`Field [${type}] already exists, and cannot support multiplies`)
            return false
        }

        const fieldRender = this.renderField({ type: type, ...field })

        if (fieldRender) {
            currentFields.push(fieldRender)
            this.setState({ fields: currentFields })
        }
    }

    canSubmit = () => {
        return Boolean(this.state.name && this.state.fields.length > 0)
    }

    submit = async () => {
        if (!this.canSubmit()) {
            antd.notification.warning({
                message: "Missing fields",
                description: "You need to fill the name and at least one field to submit.",
            })

            return false
        }

        this.clearError()
        this.toogleSubmitting(true)

        const formula = this.getFormula(this.state.type)
        const fields = this.getCurrentFieldsState()

        let payload = {
            type: this.state.type,
            name: this.state.name,
            properties: {},
        }

        // parse fields values and keys
        fields.forEach((field) => {
            // TODO: Support multiple values for the same type
            return payload.properties[field.type] = field.value
        })

        // process payload additions
        if (typeof formula.submitPayload === "object") {
            payload = {
                ...payload,
                ...formula.submitPayload,
            }
        }
        if (typeof formula.submitPayload === "function") {
            const payloadValue = formula.submitPayload(payload)

            if (payloadValue) {
                payload = {
                    ...payload,
                    ...payloadValue,
                }
            }
        }

        if (this.state.submitToCatalog) {
            // send to api
            await this.api.put.fabric(payload).catch((response) => {
                console.error(response)
                return this.setState({ error: response })
            })
        }

        // handle results
        this.toogleSubmitting(false)

        if (typeof this.props.handleDone === "function") {
            this.props.handleDone(payload)
        }

        if (!this.state.error && typeof this.props.close === "function") {
            this.props.close()
        }
    }

    //* RENDERS
    renderFieldsSelector = () => {
        return <antd.Menu onClick={(e) => this.appendFieldByType(e.key)} >
            {Object.keys(FIELDS).map((key) => {
                const field = FIELDS[key]
                const disabled = this.existsTypeOnCurrentFields(key) && !field.allowMultiple

                return <antd.Menu.Item disabled={disabled} key={key}>
                    {field.icon && createIconRender(field.icon)}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                </antd.Menu.Item>
            })}
        </antd.Menu>
    }

    renderTypesSelector = () => {
        const types = Object.keys(FORMULAS)

        return <antd.Menu onClick={(e) => this.loadType(e.key)}>
            {types.map((type) => {
                const typeFormula = FORMULAS[type]

                return <antd.Menu.Item key={type}>
                    {(typeFormula.icon && createIconRender(typeFormula.icon)) ?? null}
                    {typeFormula.label ?? (type.charAt(0).toUpperCase() + type.slice(1))}
                </antd.Menu.Item>
            })}
        </antd.Menu>
    }

    renderField = (field) => {
        let RenderComponent = field.component
        let ReturnRender = null

        if (RenderComponent == null) {
            console.error(`This field not have a component defined: ${field.type}`)

            antd.notification.error({
                message: "Missing component",
                description: `This field not have a component defined: ${field.type}`,
            })

            return null
        }

        if (typeof RenderComponent === "string") {
            if (typeof FieldsComponents[RenderComponent] === "undefined") {
                console.error(`No component type available for field [${field.key}]`)
                return null
            }

            RenderComponent = FieldsComponents[RenderComponent]
        }

        if (!field.key) {
            field.key = this.getKeyFromLatestFieldType(field.type)
        }

        let renderProps = {
            ...field.props,
            "ignore-dragger": true,
            value: this.state.values[field.key],
            disabled: this.state.submitting,
            [field.updateEvent]: (...args) => {
                if (typeof field.onUpdate === "function") {
                    return this.onUpdateValue({ updateEvent: field.updateEvent, key: field.key }, field.onUpdate(...args))
                }
                return this.onUpdateValue({ updateEvent: field.updateEvent, key: field.key }, ...args)
            },
        }

        if (typeof field.children === "function") {
            ReturnRender = loadable(async () => {
                try {
                    const children = await field.children()
                    return () => React.createElement(RenderComponent, renderProps, children)
                } catch (error) {
                    console.log(error)

                    antd.notification.error({
                        message: "Error loading data",
                        description: "There was an error loading the data for this field. Please try again later.",
                    })

                    return () => <div>
                        <Icons.XCircle /> Error
                    </div>
                }
            }, {
                fallback: <div>Loading...</div>,
            })
        } else {
            ReturnRender = () => React.createElement(RenderComponent, renderProps)
        }
        
        return <div ignore-dragger="true" key={field.key} id={`${field.type}-${field.key}`} type={field.type} className="field" style={field.style}>
            <div ignore-dragger="true" className="content">
                <h3>{field.icon && createIconRender(field.icon)}{field.label}</h3>
                <div ignore-dragger="true" className="component">
                    <ReturnRender />
                </div>
            </div>
            <div ignore-dragger="true" className="close" onClick={() => { this.removeField(field.key) }}><Icons.X /></div>
        </div>
    }

    render() {
        if (this.state.loading) {
            return <antd.Skeleton active />
        }

        const canSubmit = this.canSubmit()
        const TypeIcon = FORMULAS[this.state.type].icon && createIconRender(FORMULAS[this.state.type].icon)

        return <div className={classnames("fabric_creator", { ["mobile"]: window.isMobile })}>
            <div key="name" className="name">
                <div className="type">
                    <antd.Dropdown trigger={["click"]} overlay={this.renderTypesSelector}>
                        {TypeIcon ?? <Icons.HelpCircle />}
                    </antd.Dropdown>
                </div>
                <antd.Input value={this.state.name} placeholder={`New ${this.state.type}`} onChange={this.onChangeName} />
            </div>

            <div className="fields">
                {this.state.submitting ? <antd.Skeleton active /> : this.state.fields}
            </div>

            <div className="bottom_actions">
                <antd.Dropdown trigger={["click"]} placement="topCenter" overlay={this.renderFieldsSelector}>
                    <antd.Button type="primary" shape="round">
                        <Icons.Plus />
                    </antd.Button>
                </antd.Dropdown>

                <antd.Button disabled={!canSubmit} loading={this.state.submitting} onClick={this.submit}>Done</antd.Button>

                <antd.Checkbox checked={this.state.submitToCatalog} onChange={this.onChangeCatalogMode}>Add to catalog</antd.Checkbox>
            </div>

            {this.state.error && <div className="error">
                {this.state.error}
            </div>}
        </div>
    }
}
