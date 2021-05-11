const umiCore = require("@umijs/core")
const fs = require("fs")
const path = require("path")
const helpers = process.runtime[0].helpers
const { verbosity } = require("@corenode/utils")

function getCwd(key) {
    if (helpers.isProjectMode()) {
        return path.resolve(process.cwd(), `packages/${key}`)
    }
    if (!path.isAbsolute(key)) {
        return path.relative(key)
    }

    return path.resolve(key)
}

module.exports = {
    pkg: "umi-dev",
    init: (lib, argv) => {
        const { cli } = lib.builtIn
        const from = process.argv[3]
        const fromCWD = getCwd(from)

        const { Service } = require("umi/lib/ServiceWithBuiltIn")
        const initWebpack = require("umi/lib/initWebpack").default

        async function runDev() {
            console.log("Starting umi development server")

            try {
                process.env.NODE_ENV = 'development'
                initWebpack()

                const service = new Service({
                    cwd: fromCWD,
                    pkg: path.resolve(fromCWD, 'package.json')
                })

                await service.run({
                    name: 'dev',
                    args: {}
                })

                let closed = false;
                // kill(2) Ctrl-C
                process.once('SIGINT', () => onSignal('SIGINT'));
                // kill(3) Ctrl-\
                process.once('SIGQUIT', () => onSignal('SIGQUIT'));
                // kill(15) default
                process.once('SIGTERM', () => onSignal('SIGTERM'));

                function onSignal(signal) {
                    if (closed) return
                    closed = true

                    service.applyPlugins({
                        key: 'onExit',
                        type: service.ApplyPluginsType.event,
                        args: {
                            signal,
                        },
                    })
                    process.exit(0)
                }
            } catch (error) {
                verbosity.dump(error)
                verbosity.error(error.message)
                process.exit(1)
            }
        }

        cli.add({
            command: "umi-dev",
            exec: () => {
                runDev()
            }
        })
    }
}