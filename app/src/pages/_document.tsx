import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@material-ui/styles'
// THIS FILE IS REQUIRED FOR MATERIAL-UI STYLES TO LOAD IN NEXT.JS
//  reference: https://github.com/mui-org/material-ui/blob/master/examples/nextjs/pages/_document.js
//
import { ServerStyleSheet } from 'styled-components'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const styledComponentsSheet = new ServerStyleSheet()
    const materialSheets = new ServerStyleSheets()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            styledComponentsSheet.collectStyles(
              materialSheets.collect(<App {...props} />)
            ),
        })
      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <React.Fragment>
            {initialProps.styles}
            {materialSheets.getStyleElement()}
            {styledComponentsSheet.getStyleElement()}
          </React.Fragment>
        ),
      }
    } finally {
      styledComponentsSheet.seal()
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <title>Primitive Finance</title>
          <meta name="og:title" content="Primitive Finance" />
          <meta
            name="og:description"
            content="Primitive is a decentralized options protocol built on Ethereum."
          />
          <meta
            name="description"
            content="Primitive is a decentralized options protocol built on Ethereum."
          />
          <meta
            property="og:image"
            content="https://storage.googleapis.com/app-image-cdn/Screen%20Shot%202020-11-16%20at%207.21.02%20PM.png"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital@0;1&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
