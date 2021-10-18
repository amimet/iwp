const path = require('path')
const fs = require("fs")
const lessToJS = require("less-vars-to-js")

const aliases = {
    schemas: path.resolve(__dirname, './schemas'),
    extensions: path.resolve(__dirname, './src/extensions'),
    theme: path.join(__dirname, 'src/theme'),
    locales: path.join(__dirname, 'src/locales'),
    core: path.join(__dirname, 'src/core'),
    pages: path.join(__dirname, 'src/pages'),
    components: path.join(__dirname, 'src/components'),
    models: path.join(__dirname, 'src/models'),
}

// require("vite-plugin-require").default(),

module.exports = (config) => {
    if (typeof config.windowContext.process === 'undefined') {
        config.windowContext.process = Object()
    }
    
    config.windowContext.process = config.windowContext.__evite
    config.windowContext.process["versions"] = process.versions
    config.resolve.alias = {
        ...config.resolve.alias,
        ...aliases,
    }
    
    config.define = {
        global: Object()
    }

    config.css = {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                // modifyVars: lessToJS(
                //     fs.readFileSync(path.resolve(__dirname, "./config/variables.less"), "utf8")
                // ),
            }
        }
    }

    return config
}