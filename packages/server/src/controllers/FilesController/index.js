import path from "path"
import fs from "fs"
import { Schematized } from "../../lib"

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
                    const storagePath = path.join(global.uploadPath, req.decodedToken.user_id)
                    const filename = `${new Date().getTime()}-${file.filename}`

                    const urlPath = path.join(req.decodedToken.user_id, filename)
                    const diskPath = path.join(storagePath, filename)

                    if (!fs.existsSync(storagePath)) {
                        await fs.promises.mkdir(storagePath, { recursive: true })
                    }

                    await fs.promises.writeFile(diskPath, file.data)
                    urls.push(urlPath)
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
    get: (Schematized({
        required: ["id"],
        select: ["id"]
    }, async (req, res) => {
        const { id } = req.selection

        await fs.promises.access(path.join(global.uploadPath, id), fs.constants.R_OK).catch(() => {
            return res.status(404).json({
                error: "File not found",
            })
        })

        return res.sendFile(path.resolve(global.uploadPath, id))
    }))
}