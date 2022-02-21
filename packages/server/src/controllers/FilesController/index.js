import { ComplexController } from "linebridge/dist/classes"
import path from "path"
import fs from "fs"

function resolveToUrl(filepath) {
    return `${global.globalPublicURI}/uploads/${filepath}`
}

export default class FilesController extends ComplexController {
    static refName = "FilesController"
    static useMiddlewares = ["fileUpload"]

    get = {
        "/uploads/:id": async (req, res) => {
            try {
                const { id } = req.params

                const filePath = path.join(global.uploadPath, id)

                const file = await fs.promises.readFile(filePath).catch(() => {
                    return false
                })

                if (!file) {
                    return res.status(404).json({
                        error: "File not found",
                    })
                }

                return res.sendFile(filePath)
            } catch (error) {
                console.log(error)

                return res.status(500).json({
                    error: "Cannot get file",
                })
            }
        }
    }

    post = {
        "/upload": {
            middlewares: ["withAuthentication"],
            fn: async (req, res) => {
                const urls = []
                const failed = []

                if (!fs.existsSync(global.uploadPath)) {
                    await fs.promises.mkdir(global.uploadPath, { recursive: true })
                }

                if (req.files) {
                    for await (let file of req.files) {
                        try {
                            const filename = `${req.decodedToken.user_id}-${new Date().getTime()}-${file.filename}`

                            const diskPath = path.join(global.uploadPath, filename)

                            await fs.promises.writeFile(diskPath, file.data)

                            urls.push(resolveToUrl(filename))
                        } catch (error) {
                            console.log(error)
                            failed.push(file.filename)
                        }
                    }
                }

                return res.json({
                    urls: urls,
                    failed: failed,
                })
            }
        }
    }
}