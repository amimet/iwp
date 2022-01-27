import React from "react"
import config from "config"

export default () => {
    window.app.setLocation(config.app.mainPath)
    return null
}