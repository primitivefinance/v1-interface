import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import Loader from '@/components/Loader'
import Disclaimer from '@/components/Disclaimer'
import Notifs from '@/components/Notifs'

import MetaMaskOnboarding from '@metamask/onboarding'
import { Venue } from '@primitivefi/sdk'

import { useActiveWeb3React } from '@/hooks/user/index'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useRouter } from 'next/router'
import {
  useOptions,
  useUpdateOptions,
  useClearOptions,
} from '@/state/options/hooks'
import { useClearNotif } from '@/state/notifs/hooks'
import {
  useSetLoading,
  useClearPositions,
  useUpdatePositions,
} from '@/state/positions/hooks'

import { Grid, Col, Row } from 'react-styled-flexboxgrid'

import LiquidityTable from '@/components/Liquidity/LiquidityTable'

import LiquidityHeader from '@/components/Liquidity/LiquidityHeader'
import FilterBar from '@/components/Market/FilterBar'
import { useRemoveItem } from '@/state/order/hooks'

export async function getStaticProps() {
  const a = await fetch(
    `https://raw.githubusercontent.com/primitivefinance/primitive-token-lists/main/crypto-assets.json`
  )
  const asset = await a.json()

  const d = await fetch(
    `https://raw.githubusercontent.com/primitivefinance/primitive-token-lists/main/defi-tokens.json`
  )
  const defi = await d.json()

  if (!asset || !defi) {
    return {
      notFound: true,
    }
  }
  const icons = asset?.tokens
  return {
    props: {
      icons,
    }, // will be passed to the page component as props
  }
}

const Liquidity = ({ icons }) => {
  const [callPutActive, setCallPutActive] = useState(true)
  const { chainId, active, account, library } = useActiveWeb3React()
  const [id, storeId] = useState(chainId)
  const [changing, setChanging] = useState(false)
  const router = useRouter()
  const clear = useClearNotif()
  const options = useOptions()
  const updateOptions = useUpdateOptions()
  const setLoading = useSetLoading()
  const clearOptions = useClearOptions()

  useEffect(() => {
    const { ethereum, web3 } = window as any
    clearOptions()

    if (MetaMaskOnboarding.isMetaMaskInstalled() && (!ethereum || !web3)) {
      clear(0)
      router.reload()
    }
    if (ethereum) {
      updateOptions('', Venue.SUSHISWAP, true)
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
        } else {
          router.reload()
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
    updateOptions('', Venue.SUSHISWAP, true)
  }, [])
  if (!active) {
    return (
      <>
        <Spacer />
        <Loader size="lg" />
      </>
    )
  }
  if (!(chainId === 4 || chainId === 1) && active) {
    return <Text>Switch to Rinkeby or Mainnet Networks</Text>
  }
  if (
    !MetaMaskOnboarding.isMetaMaskInstalled() ||
    !(window as any)?.ethereum ||
    !(window as any)?.web3
  ) {
    return (
      <>
        <Spacer />

        <Text>Install Metamask to View Liquidity</Text>
      </>
    )
  }
  if (MetaMaskOnboarding.isMetaMaskInstalled() && !account) {
    return (
      <>
        <Spacer />
        <Text>Connect to Metamask to View Liquidity</Text>
      </>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <>
          <Spacer />
          <Text>Error Loading Liquidity Please Refresh</Text>
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
        <StyledMarket>
          <Disclaimer />
          <Notifs />
          <Grid id={'market-grid'}>
            <Col>
              <StyledHeaderContainer>
                <LiquidityHeader icons={icons} isCall={callPutActive}>
                  <FilterBar
                    active={callPutActive}
                    setCallActive={() => setCallPutActive(!callPutActive)}
                  />
                </LiquidityHeader>
              </StyledHeaderContainer>

              <LiquidityTable callActive={callPutActive} />
              <Spacer />
            </Col>
          </Grid>
        </StyledMarket>
      )}
    </ErrorBoundary>
  )
}

const StyledDiv = styled.div`
  display: inherit;
`

const StyledMarket = styled.div`
  width: 100%;
  min-height: 85vh;
  overflow-x: hidden;
  overflow-y: allowed !important;
  position: absolute;
  &::-webkit-scrollbar {
    width: 0px;
    height: 15px;
  }
  position: absolute;
  &::-webkit-scrollbar-track-piece {
    background-color: ${(props) => props.theme.color.grey[800]};
  }

  &::-webkit-scrollbar-thumb:vertical {
    height: 30px;
    background-color: ${(props) => props.theme.color.grey[700]};
  }
  scrollbar-color: ${(props) => props.theme.color.grey[800]};
  scrollbar-width: thin;
`

export const StyledLitContainer = styled.div``

const StyledHeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;
`

const Text = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
`
const StyledContainer = styled(Col)`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;
`

export default Liquidity
