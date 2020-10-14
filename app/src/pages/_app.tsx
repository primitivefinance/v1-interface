import React, {useEffect, useState, Component } from 'react'
import Router from 'next/router'

import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'

import TopBar from '../components/TopBar'
import Page from '../components/Page'
import Web3Manager from '../components/Web3Manager'
import theme from '../theme'

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    line-height: 1.5;
  }
  body {
    background-color: #040404;
    font-family: 'Nunito Sans', sans-serif;
  }
  body.fontLoaded {
    font-family: 'Nunito Sans', sans-serif;
  }
  #app {
    background-color: #040404;
    min-height: 100%;
    min-width: 100%;
  }
  span {
    color: white;
  }
`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 15000
  return library
}



export default function App ({ Component, pageProps }) {

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
      Router.events.on('routeChangeStart', () => {
        setIsLoading(true)
      })
      Router.events.on('routeChangeComplete', () => {
        setIsLoading(false)
      })
      Router.events.on('routeChangeError', () => {
        setIsLoading(false)
      })
    
    }, [isLoading, setIsLoading])
  
    return (
      <>
        <GlobalStyle/>
        <ThemeProvider theme={theme}>
          <Web3ReactProvider getLibrary={getLibrary}>
            <Web3Manager>
              <>
                <TopBar/>
                <Page>
                  <Component {...pageProps} />
                </Page>
              </>
            </Web3Manager>
          </Web3ReactProvider>
        </ThemeProvider>
      </>
    )
  }
