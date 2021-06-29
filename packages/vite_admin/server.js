const path = require('path')
const fs = require('fs')
const { createServer } = require('vite')

import reactRefresh from "@vitejs/plugin-react-refresh"
import commonjsExternals from 'vite-plugin-commonjs-externals'
import vitePluginImp from "vite-plugin-imp"
import lessToJS from "less-vars-to-js"
import builtins from "rollup-plugin-node-builtins"
import globals from "rollup-plugin-node-globals"

const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, "./config/variables.less"), "utf8")
)

createServer({
    configFile: false,
    server: {
        port: 8000
    },
    define: {
        global: {
            project
        },
        "process.env": _env,
        _env: _env
    },
    plugins: [
        reactRefresh(),
        { ...builtins({ crypto: true }), name: "rollup-plugin-node-builtins" },
        { ...globals(), name: 'rollup-plugin-node-globals' },
    ],
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                modifyVars: themeVariables,
            },
        },
    },
    resolve: {
        alias: {
            schemas: path.resolve(__dirname, './schemas'),
            interface: path.resolve(__dirname, './interface'),
            theme: path.resolve(__dirname, './src/theme'),
            locales: path.resolve(__dirname, './src/locales'),
            core: path.resolve(__dirname, './src/core'),
            config: path.resolve(__dirname, './config'),
            pages: path.resolve(__dirname, './src/pages'),
            components: path.resolve(__dirname, './src/components'),
            models: path.resolve(__dirname, './src/models'),
        },
    },
})
    .then((server) => {
        server.listen()
    })
    .catch((err) => {
        console.error(err)
    })