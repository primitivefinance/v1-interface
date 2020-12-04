import React from 'react'
import { createTheme, ThemeProvider } from 'react-neu'
import { Helmet } from "react-helmet"

import TopBar from 'components/TopBar'
import Home from 'views/Home'

export default function Index() {
  const { dark, light } = createTheme({
    baseColor: { h: 255, s: 255, l: 255 },
    borderRadius: 16,
  })
  return (
    <ThemeProvider darkTheme={dark} lightTheme={light}>
      <Helmet>
          <meta charSet="utf-8" />
          <title>Primitive Protocol</title>
          <meta
            name="og:description"
            content="Library of documentation, resources, and interfaces for the Primitive protocol."
          />
          <meta
            name="description"
            content="Library of documentation, resources, and interfaces for the Primitive protocol."
          />
          <meta
            property="og:image"
            content="https://storage.googleapis.com/app-image-cdn/Screen%20Shot%202020-11-16%20at%207.21.02%20PM.png"
          />
          <link rel="canonical" href="http://primitive.finance" />
        </Helmet>
      <TopBar />
      <Home />
    </ThemeProvider>
  )
}
