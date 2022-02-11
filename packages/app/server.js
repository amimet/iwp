const express = require("express")
const path = require("path")
const pkg = require("./package.json")

const app = express()
const port = process.env.PORT || 8000

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "public")))

// An api endpoint that returns a short list of items
app.get("/lastVersion", (req, res) => {
    return res.json({
        version: pkg.version
    })
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"))
})

app.listen(port)

console.log("App is listening on port " + port)