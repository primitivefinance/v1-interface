import React from 'react'
import { Provider } from 'react-redux'
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'

import Layout from '@/components/Layout'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'

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
  color: ${(props) => props.theme.color.white};
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
            <Provider store={store}>
              <Updater />
              <Layout>
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
                    />
                    <Spacer />
                  </WaitingRoom>
                ) : (
                  <>
                    <Component {...pageProps} />
                  </>
                )}
              </Layout>
            </Provider>
          </>
        </ThemeProvider>
      </Web3ReactProvider>
    </>
  )
}
