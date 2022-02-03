import React from "react"
import supportedLanguages from "schemas/supportedLanguages"
import { Select } from "antd"

export default [
    {
        "id": "language",
        "group": "general",
        "type": "Select",
        "icon": "MdTranslate",
        "title": "Language",
        "title_i18n": "settings_general_language",
        "description": "Choose a language for the application",
        "description_i18n": "settings_general_language_description",
        "props": {
            children: supportedLanguages.map((language) => {
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
        "title_i18n": "settings_sidebar_edit",
        "emitEvent": "edit_sidebar",
        "noStorage": true
    },
    {
        "id": "collapseOnLooseFocus",
        "group": "sidebar",
        "type": "Switch",
        "title": "Auto Collapse",
        "description": "Collapse the sidebar when loose focus",
        "title_i18n": "settings_sidebar_autoCollapse",
        "description_i18n": "settings_sidebar_autoCollapse_description"
    },
    {
        "id": "reduceAnimations",
        "group": "aspect",
        "type": "Switch",
        "icon": "MdOutlineAnimation",
        "title": "Reduce animation",
        "title_i18n": "settings_aspect_reduceAnimation",
        "experimental": true
    },
    {
        "id": "darkMode",
        "group": "aspect",
        "type": "Switch",
        "icon": "Moon",
        "title": "Dark Mode",
        "title_i18n": "settings_aspect_darkMode",
        "emitEvent": "darkMode",
        "experimental": true
    },
    {
        "id": "primaryColor",
        "group": "aspect",
        "type": "SliderColorPicker",
        "title": "Primary color",
        "description": "Change primary color of the application.",
        "title_i18n": "settings_aspect_primaryColor",
        "description_i18n": "settings_aspect_primaryColor_description",
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
        "title_i18n": "settings_aspect_resetTheme",
        "props": {
            "children": "Default Theme"
        },
        "emitEvent": "resetTheme",
        "noStorage": true
    }
]