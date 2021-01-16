import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'
import { useActiveWeb3React } from '@/hooks/user/index'
import MetaMaskOnboarding from '@metamask/onboarding'

import Notifs from '@/components/Notifs'
import Spacer from '@/components/Spacer'

import {
  ADDRESS_FOR_MARKET,
  Operation,
  ACTIVE_EXPIRIES,
} from '@/constants/index'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import { useClearNotif } from '@/state/notifs/hooks'

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
import { useOptions, useUpdateOptions } from '@/state/options/hooks'

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
  const { chainId, active, account, library } = useActiveWeb3React()
  const initExpiry = ACTIVE_EXPIRIES[ACTIVE_EXPIRIES.length - 1]
  const [expiry, setExpiry] = useState(initExpiry)
  const [id, storeId] = useState(chainId)
  const [changing, setChanging] = useState(false)
  const router = useRouter()
  const clear = useClearNotif()
  const options = useOptions()
  const updateOptions = useUpdateOptions()
  const setLoading = useSetLoading()

  useEffect(() => {
    const { ethereum, web3 } = window as any

    if (MetaMaskOnboarding.isMetaMaskInstalled() && (!ethereum || !web3)) {
      clear(0)
      router.push('/markets')
      updateOptions('')
    }

    if (market === 'eth') {
      router.push('/markets/weth/calls')
    }
    if (ethereum) {
      const handleChainChanged = () => {
        if (id !== chainId) {
          setChanging(true)
          storeId(chainId)
          // eat errors
          clear(0)
          router.reload()
        }
      }
      const handleAccountChanged = () => {
        if (!options.loading) {
          clear(0)
          setLoading()
        }
      }
      if (ethereum?.on) {
        ethereum?.on('chainChanged', handleChainChanged)
        ethereum?.on('accountsChanged', handleAccountChanged)
      }
      return () => {
        if (ethereum?.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountChanged)
        }
      }
    }
  }, [id, chainId, storeId])
  useEffect(() => {
    if (data[1]) {
      setCallPutActive(data[1] === 'calls')
    }
  }, [setCallPutActive, data])
  const handleFilterType = () => {
    setCallPutActive(!callPutActive)
    if (callPutActive) {
      router.push(`/markets/[...id]`, `/markets/${market}/puts`, {
        shallow: true,
      })
    } else {
      router.push(`/markets/[...id]`, `/markets/${market}/calls`, {
        shallow: true,
      })
    }
  }
  const handleFilterExpiry = (exp: number) => {
    setExpiry(exp)
  }

  useEffect(() => {
    setExpiry(initExpiry)
  }, [chainId])
  useEffect(() => {
    updateOptions(market.toUpperCase(), ADDRESS_FOR_MARKET[market])
  }, [])
  if (!active || market === 'eth') {
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
      {changing ? (
        <>
          <Spacer />
          <Spacer />
          <Loader size="lg" />
        </>
      ) : (
        <>
          <Disclaimer />
          <Notifs />
          <StyledMarket>
            <Grid id={'market-grid'}>
              <Row>
                <StyledContainer sm={12} md={8} lg={8} id="table-column">
                  <StyledMain>
                    <MarketHeader
                      marketId={market}
                      isCall={callPutActive ? 0 : 1}
                    />
                    <Spacer size="sm" />
                    <FilterBar
                      active={callPutActive}
                      setCallActive={handleFilterType}
                      expiry={expiry}
                      setExpiry={handleFilterExpiry}
                    />
                    <Spacer size="sm" />
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
                <StyledCol sm={12} md={4} lg={4} id="sidebar-column">
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
                      <Spacer />
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
  overflow-y: auto !important;
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
  overflow-y: scroll !important;
  justify-content: center;
  &::-webkit-scrollbar {
    width: 5px;
    height: 15px;
  }

  &::-webkit-scrollbar-track-piece {
    background-color: ${(props) => props.theme.color.grey[800]};
  }

  &::-webkit-scrollbar-thumb:vertical {
    height: 30px;
    background-color: ${(props) => props.theme.color.grey[700]};
  }
  scrollbar-color: ${(props) => props.theme.color.grey[700]}
    ${(props) => props.theme.color.grey[800]};
  scrollbar-width: thin;
`
const StyledText = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
`

export default Market
