import ReactDOMServer from "react-dom/server"
import React from "react"
import { html } from "vite-plugin-ssr"

const passToClient = ["pageProps"]

function render(pageContext) {
  const { Page, pageProps } = pageContext

  const pageHtml = ReactDOMServer.renderToString(
    <div>
      <Page {...pageProps} />
    </div>
  )

  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="page-view">${html.dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`
}


export { render }
export { passToClient }
