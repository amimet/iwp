const path = require('path')
const fs = require("fs")
const lessToJS = require("less-vars-to-js")
const commonjs = require("@rollup/plugin-commonjs")

const aliases = {
    schemas: path.resolve(__dirname, './schemas'),
    extensions: path.resolve(__dirname, './src/extensions'),
}

// require( "vite-plugin-require").default(),

module.exports = (config) => {
    if (typeof config.windowContext.process === 'undefined') {
        config.windowContext.process = Object()
    }

    config.windowContext.process["versions"] = process.versions
    config.resolve.alias = {
        ...config.resolve.alias,
        ...aliases,
    }

    //config.plugins.push(commonjs())

    config.css = {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                modifyVars: lessToJS(
                    fs.readFileSync(path.resolve(__dirname, "./config/variables.less"), "utf8")
                ),
            }
        }
    }

    if (typeof config.ssr === "undefined") {
        config.ssr = Object()
    }
    config.ssr.external = [
        "os",
        "@corenode/utils",
        "corenode",
        "path",
        "fs"
    ]

    config.ssr.target = "webworker"

    return config
}