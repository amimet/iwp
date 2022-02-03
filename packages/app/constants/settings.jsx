import React from "react"
import config from "config"
import { Select } from "antd"

export default [
    {
        "id": "language",
        "group": "general",
        "type": "Select",
        "icon": "MdTranslate",
        "title": "Language",
        "description": "Choose a language for the application",
        "props": {
            children: config.i18n.languages.map((language) => {
                return <Select.Option value={language.locale}>{language.name}</Select.Option>
            })
        },
        "emitEvent": "changeLanguage"
    },
    {
        "id": "edit_sidebar",
        "group": "sidebar",
        "type": "Button",
        "icon": "Edit",
        "title": "Edit Sidebar",
        "emitEvent": "edit_sidebar",
        "noStorage": true
    },
    {
        "id": "collapseOnLooseFocus",
        "group": "sidebar",
        "type": "Switch",
        "title": "Auto Collapse",
        "description": "Collapse the sidebar when loose focus",
    },
    {
        "id": "reduceAnimations",
        "group": "aspect",
        "type": "Switch",
        "icon": "MdOutlineAnimation",
        "title": "Reduce animation",
        "experimental": true
    },
    {
        "id": "darkMode",
        "group": "aspect",
        "type": "Switch",
        "icon": "Moon",
        "title": "Dark mode",
        "emitEvent": "darkMode",
        "experimental": true
    },
    {
        "id": "primaryColor",
        "group": "aspect",
        "type": "SliderColorPicker",
        "title": "Primary color",
        "description": "Change primary color of the application.",
        "emitEvent": "modifyTheme",
        "emissionValueUpdate": (value) => {
            return {
                primaryColor: value
            }
        }
    },
    {
        "id": "resetTheme",
        "group": "aspect",
        "type": "Button",
        "title": "Reset theme",
        "props": {
            "children": "Default Theme"
        },
        "emitEvent": "resetTheme",
        "noStorage": true
    }
]