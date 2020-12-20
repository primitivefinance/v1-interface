import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'
import { useActiveWeb3React } from '@/hooks/user/index'
import MetaMaskOnboarding from '@metamask/onboarding'

import Notifs from '@/components/Notifs'
import Spacer from '@/components/Spacer'
import SplashScreen from '@/components/SplashScreen'

import { ADDRESS_FOR_MARKET, Operation } from '@/constants/index'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import { useClearNotif } from '@/state/notifs/hooks'
import { useItem } from '@/state/order/hooks'

import Loader from '@/components/Loader'
import Disclaimer from '@/components/Disclaimer'

import {
  FilterBar,
  MarketHeader,
  OptionsTable,
  TransactionCard,
  OrderCard,
  PositionsCard,
} from '@/components/Market'
import BalanceCard from '@/components/Market/BalanceCard'
import { useSetLoading } from '@/state/positions/hooks'
import { useOptions } from '@/state/options/hooks'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = params?.id

  return {
    props: {
      market: data[0],
      data: data,
    },
  }
}

const Market = ({ market, data }) => {
  const [callPutActive, setCallPutActive] = useState(true)
  const [expiry, setExpiry] = useState(1609286400)
  const { chainId, active, account } = useActiveWeb3React()
  const { item, orderType } = useItem()
  const router = useRouter()
  const clear = useClearNotif()
  const options = useOptions()
  const setLoading = useSetLoading()

  useEffect(() => {
    const { ethereum, web3 } = window as any

    if (MetaMaskOnboarding.isMetaMaskInstalled() && (!ethereum || !web3)) {
      clear(0)
      router.push('/markets')
    }
    const handleChainChanged = () => {
      // eat errors
      clear(0)
      setTimeout(() => {
        console.log('handled!')
      }, 2000)
    }
    const handleAccountChanged = () => {
      if (!options.loading) {
        clear(0)
        setLoading()
      }
    }

    ethereum?.on('chainChanged', handleChainChanged)
    ethereum?.on('accountsChanged', handleAccountChanged)

    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener('chainChanged', handleChainChanged)
        ethereum.removeListener('accountsChanged', handleAccountChanged)
      }
    }
  })
  useEffect(() => {
    if (data[1]) {
      setCallPutActive(data[1] === 'calls')
    }
  }, [setCallPutActive])
  const handleFilterType = () => {
    setCallPutActive(!callPutActive)
    if (callPutActive) {
      if (market === 'weth') {
        router.push(`/markets/[...id]`, `/markets/eth/puts`, {
          shallow: true,
        })
      } else {
        router.push(`/markets/[...id]`, `/markets/${market}/puts`, {
          shallow: true,
        })
      }
    } else {
      if (market === 'weth') {
        router.push(`/markets/[...id]`, `/markets/eth/calls`, {
          shallow: true,
        })
      } else {
        router.push(`/markets/[...id]`, `/markets/${market}/calls`, {
          shallow: true,
        })
      }
    }
  }
  const handleFilterExpiry = (exp: number) => {
    setExpiry(exp)
  }

  if (!active) {
    return (
      <>
        <Spacer />
        <Loader size="lg" />
      </>
    )
  }
  if (!(chainId === 4 || chainId === 1) && active) {
    return <StyledText>Please switch to Rinkeby or Mainnet Networks</StyledText>
  }
  if (
    !MetaMaskOnboarding.isMetaMaskInstalled() ||
    !(window as any)?.ethereum ||
    !(window as any)?.web3
  ) {
    return <StyledText>Please Install Metamask to View Markets</StyledText>
  }
  if (MetaMaskOnboarding.isMetaMaskInstalled() && !account) {
    return <StyledText>Please Connect to Metamask to View Markets</StyledText>
  }
  return (
    <ErrorBoundary
      fallback={
        <>
          <Spacer />
          <StyledText>Error Loading Market, Please Refresh</StyledText>
        </>
      }
    >
      {router.isFallback ? (
        <SplashScreen />
      ) : (
        <>
          <Disclaimer />
          <Notifs />
          <StyledMarket>
            <Grid>
              <Row>
                <StyledContainer sm={12} md={8} lg={8}>
                  <StyledMain>
                    <MarketHeader
                      marketId={market}
                      isCall={callPutActive ? 0 : 1}
                    />
                    <FilterBar
                      active={callPutActive}
                      setCallActive={handleFilterType}
                      expiry={expiry}
                      setExpiry={handleFilterExpiry}
                    />

                    <ErrorBoundary
                      fallback={
                        <>
                          <Spacer />
                          <StyledText>
                            Error Loading Options, Please Refresh
                          </StyledText>
                        </>
                      }
                    >
                      <OptionsTable
                        asset={market}
                        assetAddress={ADDRESS_FOR_MARKET[market]}
                        optionExp={expiry}
                        callActive={callPutActive}
                      />
                    </ErrorBoundary>
                  </StyledMain>
                </StyledContainer>
                <StyledCol sm={12} md={4} lg={4}>
                  <StyledSideBar>
                    <ErrorBoundary
                      fallback={
                        <>
                          <Spacer />
                          <StyledText>
                            Error Loading Positions, Please Refresh
                          </StyledText>
                        </>
                      }
                    >
                      <Spacer size="sm" />
                      <PositionsCard />
                      <OrderCard orderState={data} />
                      <BalanceCard />
                      <TransactionCard />
                      <Spacer />
                    </ErrorBoundary>
                  </StyledSideBar>
                </StyledCol>
              </Row>
            </Grid>
          </StyledMarket>
        </>
      )}
    </ErrorBoundary>
  )
}

const StyledCol = styled(Col)`
  overflow-x: hidden;
`

const StyledContainer = styled(Col)`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;
`
const StyledMain = styled.div``

const StyledMarket = styled.div`
  width: 100%;
  height: 90%;
  position: absolute;
  overflow-x: hidden;
  overflow-y: scroll !important;
`

const StyledSideBar = styled.div`
  background: none;
  width: 25em;
  box-sizing: border-box;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  padding: ${(props) => props.theme.spacing[2]}px
    ${(props) => props.theme.spacing[2]}px
    ${(props) => props.theme.spacing[4]}px
    ${(props) => props.theme.spacing[4]}px;
  padding-top: 0 !important;
  height: 90vh;
  position: fixed;
  overflow: auto;
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: scroll;
`
const StyledText = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
`

export default Market
