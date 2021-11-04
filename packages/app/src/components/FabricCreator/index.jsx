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
    operations: {
        label: "Operations",
        type: "input",

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

        fields: [],

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

    removeField = (key) => {
        console.log(key)
    }

    generateFieldRender = (field) => {
        const { key, style, icon, type, label, updateEvent, props } = field

        const component = FormComponents[type]

        if (typeof component === "undefined") {
            console.error(`No component type available for field [${key}]`)
            return null
        }

        return <div key={key} id={key} className="field" style={style}>
            <div className="close" onClick={() => { this.removeField(key) }}><Icons.X /></div>
            <h4>{icon && createIconRender(icon)}{label}</h4>
            {React.createElement(component, {
                ...props, [updateEvent]: (...args) => {
                    this.onUpdateValue({ updateEvent, key }, ...args)
                },
            })}
        </div>
    }

    generateRendersFieldsByTypes = (...maps) => {
        const renders = []
        
        maps.forEach((fieldsTypes) => {
            fieldsTypes.forEach((fieldType) => {
                const form = FieldsForms[fieldType]

                if (typeof form === "undefined") {
                    console.error(`No form available for field [${fieldType}]`)
                    return null
                }

                let key = `${fieldType}_${renders.length}`

                renders.push(this.generateFieldRender({ key: key, ...form }))
            })
        })

        return renders
    }

    render() {
        if (this.state.loading) {
            return <antd.Skeleton active />
        }

        const TypeIcon = FabricItemTypesIcons[this.state.type] && createIconRender(FabricItemTypesIcons[this.state.type])
        const Renders = () => this.generateRendersFieldsByTypes(this.state.defaultFields, this.state.customFields)

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
                    <Renders />
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