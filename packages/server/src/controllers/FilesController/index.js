import { ComplexController } from "linebridge/dist/classes"
import path from "path"
import fs from "fs"

function resolveToUrl(filepath) {
    return `${global.globalPublicURI}/uploads/${filepath}`
}

export default class FilesController extends ComplexController {
    static refName = "FilesController"

    get = {
        "/uploads/:id": (req, res) => {
            const filePath = path.join(global.uploadPath, req.params?.id)
            return res.sendFile(filePath)
        }
    }

    post = {
        "/upload": {
            middlewares: ["withAuthentication", "fileUpload"],
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