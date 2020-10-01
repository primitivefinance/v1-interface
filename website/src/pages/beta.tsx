import React from 'react'
import { Link } from 'gatsby'
import { createTheme, ThemeProvider } from 'react-neu'

import TopBar from 'components/TopBar'
import Beta from 'views/Beta'

export default function Index() {
  const { dark, light } = createTheme({
    baseColor: { h: 255, s: 255, l: 255 },
    borderRadius: 16,
  })
  return (
    <ThemeProvider darkTheme={dark} lightTheme={light}>
      <TopBar />
      <Beta />
    </ThemeProvider>
  )
}
