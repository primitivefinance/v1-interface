import React, { useEffect, useState, Component } from 'react'

import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'

import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'
import BetaBanner from '@/components/BetaBanner'

import theme from '../theme'

import { default as TransactionProvider } from '@/contexts/Transactions/Transactions'
import { default as TransactionUpdater } from '@/contexts/Transactions/updater'

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    line-height: 1.5;
    max-width: 100%;
    overflow-x: initial !important;
    overflow-y: visible;
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
const StyledText = styled.div`
  font-size: 18px;
  color: white;
`
const WaitingRoom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-size: 36px;
  justify-content: center;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  width: 100%;
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

export default function App({ Component, pageProps }) {
  const { error, active } = useWeb3React()
  return (
    <>
      <GlobalStyle />
      <Web3ReactProvider getLibrary={getLibrary}>
        <ThemeProvider theme={theme}>
          <>
            <TransactionProvider>
              <Updater />
              <Layout>
                <BetaBanner isOpen={true} />
                {active ? (
                  <WaitingRoom>
                    <Spacer size="lg" />
                    <StyledText>
                      This interface requires a connection from the browser to
                      Ethereum.
                    </StyledText>
                    <Button
                      size="sm"
                      text="Learn More"
                      variant="transparent"
                      href="https://ethereum.org/en/wallets/"
                    />{' '}
                    <Spacer />
                  </WaitingRoom>
                ) : (
                  <Component {...pageProps} />
                )}
              </Layout>
            </TransactionProvider>
          </>
        </ThemeProvider>
      </Web3ReactProvider>
    </>
  )
}
