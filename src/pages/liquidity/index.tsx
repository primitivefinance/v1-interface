import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import Loader from '@/components/Loader'
import Disclaimer from '@/components/Disclaimer'

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
interface CardProps {
  title?: string
  description?: string
  multiplier?: number
}

export const DataCard: React.FC<CardProps> = ({
  children,
  title,
  description,
  multiplier,
}) => {
  return (
    <StyledCardContainer multiplier={multiplier ? multiplier : 2}>
      <CardContent>
        <CardTitle>{title ? title : 'No title'}</CardTitle>
      </CardContent>
      <CardContent>
        <Text>
          {description ? description : children ? children : 'No description'}
        </Text>
      </CardContent>
    </StyledCardContainer>
  )
}

const StyledL = styled(Box)`
  margin-top: -1.5em;
  margin-bottom: -1.1em;
`

export const Graph: React.FC = () => {
  return <Box>Graph</Box>
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

    if (MetaMaskOnboarding.isMetaMaskInstalled() && (!ethereum || !web3)) {
      clear(0)
      clearOptions()
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
        <>
          <Disclaimer />
          <StyledMarket>
            <Grid id={'market-grid'}>
              <Row>
                <StyledLitContainer>
                  <div>
                    <StyledHeaderContainer>
                      <LiquidityHeader icons={icons} isCall={callPutActive}>
                        <FilterBar
                          active={callPutActive}
                          setCallActive={() => setCallPutActive(!callPutActive)}
                        />
                      </LiquidityHeader>
                    </StyledHeaderContainer>

                    <StyledHeaderContainer>
                      <LiquidityTable callActive={callPutActive} />
                    </StyledHeaderContainer>
                  </div>
                </StyledLitContainer>
              </Row>
            </Grid>
          </StyledMarket>
        </>
      )}
    </ErrorBoundary>
  )
}

const StyledMarket = styled.div`
  width: 100%;
  height: 90%;
  position: absolute;
  overflow-x: hidden;
  overflow-y: auto !important;
  &::-webkit-scrollbar {
    width: 0px;
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

export const StyledLitContainer = styled(Col)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: ${(props) => props.theme.spacing[3]}px;
`

interface CardContainerProps {
  multiplier: number
}

const StyledCardContainer = styled.span<CardContainerProps>`
  background: ${(props) => props.theme.color.grey[800]};
  //border: 1px solid grey;
  border-radius: ${(props) => props.theme.borderRadius}px;
  margin: ${(props) => props.theme.spacing[3]}px;
  padding: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.contentWidth * (1 / props.multiplier)}px;
  justify-content: center;
  display: flex;
  flex-direction: column;
`

const CardTitle = styled.span`
  font-size: 18px;
  color: ${(props) => props.theme.color.white};
  opacity: 0.5;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
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

const CardContent = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${(props) => props.theme.spacing[2]}px;
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
