import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Provider } from 'react-redux'
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'

import Layout from '@/components/Layout'
import store from '@/state/index'
import theme from '../theme'
import TransactionUpdater from '@/state/transactions/updater'

const GlobalStyle = createGlobalStyle`
  html,
  body {
    line-height: 1.5;
    margin: 0;
    display: block;
  }
  head {
    display: none;
  }
  meta {
    display: none;
  }
  title {
    display: none;
  }
  link {
    display: none;
  }
  style {
    display: none;
  }
  script {
    display: none;
  }
  body {
    background-color: #040404;
    cursor: default;
    font-family: 'Nunito Sans', sans-serif;
    position: static;
    opacity: 1;
    font-size: inital;
  }
  body.fontLoaded {
    font-family: 'Nunito Sans', sans-serif;
  }
  #app {
    background-color: #040404;
    min-height: 100%;
    overflow-x: hidden;
    min-width: 100%;
  }
  span {
    position: static;
  }
  layer {
    display: block;
  }
  svg:not(:root) {
    overflow: visible;
  }
  input {
    display: block;
    position: static;
    width: 100%;
  }
  button {
    pointer-events: inherit;
    display: block;
    position: static;
  }
  img {
    display: block;
    position: static;
  }
  html, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed, 
  figure, figcaption, footer, header, hgroup, 
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    line-height: 1.3;
  }
  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure, 
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  body {
    line-height: 1;
  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 15000
  return library
}

const Updater = () => {
  return (
    <>
      <TransactionUpdater />
    </>
  )
}

export default function App({ Component, pageProps }): any {
  const router = useRouter()
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const handleRouteChange = (url, { shallow }) => {
      if (!shallow) {
        setLoad(true)
      }
    }

    const handleRouteComplete = () => {
      setLoad(false)
    }
    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteComplete)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      router.events.off('routeChangeComplete', handleRouteComplete)
    }
  }, [])

  return (
    <>
      <GlobalStyle />
      <Web3ReactProvider getLibrary={getLibrary}>
        <ThemeProvider theme={theme}>
          <>
            <Provider store={store}>
              <Updater />
              <Layout loading={load}>
                <Component {...pageProps} />
              </Layout>
            </Provider>
          </>
        </ThemeProvider>
      </Web3ReactProvider>
    </>
  )
}
