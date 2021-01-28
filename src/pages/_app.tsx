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
  }
  body {
    background-color: #040404;
    cursor: default;
    font-family: 'Nunito Sans', sans-serif;
    position: relative;
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
    color: white;
  }
  div {
    display: block;
  }
  svg:not(:root) {
    overflow: visible;
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
