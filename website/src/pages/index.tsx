import React from 'react'

import { createTheme, ThemeProvider } from 'react-neu'

import TopBar from 'components/TopBar'
import Home from 'views/Home'

export default function Index() {
  const { dark, light } = createTheme({
    baseColor: { h: 255, s: 255, l: 255 },
    borderRadius: 16,
  })
  return (
    <ThemeProvider darkTheme={dark} lightTheme={light}>
      <TopBar />
      <Home />
    </ThemeProvider>
  )
}
