import React from 'react'
import * as antd from 'antd'
import { Icons, createIconRender } from "components/Icons"

import "./index.less"

const FormComponents = {
    "input": antd.Input,
}

// FIELDS
const FieldsForms = {
    description: {
        label: "Description",
        type: "input",
        updateEvent: "onChange",
        style: {
            minWidth: "300px",
        },
        props: {
            placeholder: "Describe something...",
        }
    },
}

//FORMULAS
const ProductFormula = {
    defaultFields: [
        "description",
        "operations",
    ]
}

const OperationFormula = {
    defaultFields: [
        "description",
        "task",
    ]
}

const PhaseFormula = {
    defaultFields: [
        "description",
        "task",
    ]
}

const TaskFormula = {
    defaultFields: [
        "description",
        "tasks",
    ]
}

const FORMULAS = {
    product: ProductFormula,
    operation: OperationFormula,
    phase: PhaseFormula,
    task: TaskFormula,
}

// TYPES
const FabricItemTypesIcons = {
    "product": "Box",
    "operation": "Settings",
    "phase": "GitCommit",
    "task": "Tool",
}

const FabricItemTypes = ["product", "operation", "phase", "task"]

export default class FabricCreator extends React.Component {
    state = {
        loading: true,
        values: {},
        defaultFields: [],
        customFields: [],
        name: null,
        type: null,
        uuid: null,
    }

    componentDidMount = async () => {
        await this.setItemType("product")
        this.setState({ loading: false })
    }

    setItemType = (type) => {
        const formulaKeys = Object.keys(FORMULAS)
        const defaultFields = []

        if (formulaKeys.includes(type)) {
            const formula = FORMULAS[type]
            formula.defaultFields.forEach(field => {
                defaultFields.push(field)
            })
        } else {
            console.error(`Cannot load default fields from formula with type ${type}`)
        }

        this.setState({ type: type, name: `New fabric ${type}`, defaultFields: defaultFields })
    }

    addNewCustomField = (fieldType) => {
        const customFields = [...this.state.customFields]
        customFields.push(fieldType)

        this.setState({ customFields })
    }

    renderNewCustomFieldMenuSelector = () => {
        return <antd.Menu
            onClick={(e) => {
                this.addNewCustomField(e.key)
            }}
        >
            {Object.keys(FieldsForms).map((field) => {
                const form = FieldsForms[field]
                const icon = form.icon && createIconRender(form.icon)

                return <antd.Menu.Item key={field}>
                    {icon ?? null}
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                </antd.Menu.Item>
            })}
        </antd.Menu>
    }

    renderTypeMenuSelector = () => {
        return <antd.Menu
            onClick={(e) => {
                this.setItemType(e.key)
            }}
        >
            {FabricItemTypes.map((type) => {
                const TypeIcon = FabricItemTypesIcons[type] && createIconRender(FabricItemTypesIcons[type])

                return <antd.Menu.Item key={type}>
                    {TypeIcon ?? null}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </antd.Menu.Item>
            })}
        </antd.Menu>
    }

    onUpdateValue = (event, value) => {
        const { updateEvent, key } = event

        let state = this.state
        state.values[key] = value

        this.setState(state)
    }

    renderFields = (fields) => {
        return fields.map((field) => {
            const form = FieldsForms[field]

            if (typeof form === "undefined") {
                console.error(`No form available for field [${field}]`)
                return null
            }

            const { type, label, icon, updateEvent, style, props } = form
            const component = FormComponents[type]
            
            if (typeof component === "undefined") {
                console.error(`No component type available for field [${field}]`)
                return null
            }
            
            let key = `${field}_${Object.keys(this.state.values).length}`
            
            return <div key={key} className="field" style={style}>
                <h4>{icon && createIconRender(icon)}{label}</h4>
                {React.createElement(component, {
                    ...props, [updateEvent]: (...args) => {
                        this.onUpdateValue({ updateEvent, key }, ...args)
                    },
                })}
            </div>
        })
    }

    render() {
        if (this.state.loading) {
            return <antd.Skeleton active />
        }

        const TypeIcon = FabricItemTypesIcons[this.state.type] && createIconRender(FabricItemTypesIcons[this.state.type])
        
        return <div className="fabric_creator">
            <div key="name" className="name">
                <div className="type">
                    <antd.Dropdown trigger={['click']} overlay={this.renderTypeMenuSelector}>
                        {TypeIcon ?? <Icons.HelpCircle />}
                    </antd.Dropdown>
                </div>
                <antd.Input defaultValue={this.state.name} />
            </div>
            <div className="fields">
                <div className="wrap">
                    {this.renderFields(this.state.defaultFields)}
                    {this.renderFields(this.state.customFields)}
                </div>
                <antd.Dropdown trigger={['click']} placement="topCenter" overlay={this.renderNewCustomFieldMenuSelector}>
                    <div className="bottom_actions">
                        <Icons.Plus />
                    </div>
                </antd.Dropdown>
            </div>
        </div>
    }
}