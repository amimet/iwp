import ReactDOM from "react-dom"
import React from "react"
import { getPage } from "vite-plugin-ssr/client"

async function hydrate() {
	const pageContext = await getPage()
	const { Page, pageProps } = pageContext

	ReactDOM.hydrate(<Page {...pageProps} />, document.getElementById("page-view"))
}

hydrate()
