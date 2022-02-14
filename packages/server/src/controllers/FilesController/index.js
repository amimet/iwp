import path from "path"
import fs from "fs"

function resolveToUrl(filepath) {
    return `${global.globalPublicURI}:${global.httpListenPort}/uploads/${filepath}`
}

export default {
    upload: async (req, res) => {
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
    },
    get: async (req, res) => {
        const { id } = req.params

        const filePath = path.join(global.uploadPath, id)
        return res.sendFile(filePath)
    },
}