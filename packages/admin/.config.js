const { viteExternalsPlugin } = require('vite-plugin-externals')
const path = require('path')

process.env.lessBaseVariables = path.resolve(__dirname, './config/variables.less')

module.exports = (config) => {
    config.define.process = {
        versions: process.versions
    }

    config.plugins.push(viteExternalsPlugin({
        "fast-glob": "fast-glob",
        "glob-parent": "glob-parent",
        "node": "node",
        corenode: "corenode"
    }))

    return config
}