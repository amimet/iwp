import getConfig from "./.config.js"

import { defineConfig } from "vite"
import Pages from "vite-plugin-pages"
import reactRefresh from "@vitejs/plugin-react-refresh"

export default defineConfig({
    plugins: [
        reactRefresh(),
        Pages({
            react: true,
            extensions: ["jsx", "tsx"],
        }),
    ],
    ...getConfig(),
})