import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import PageHeader from '@/components/PageHeader'
import MarketCards from '@/components/MarketCards'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import Loader from '@/components/Loader'
import Disclaimer from '@/components/Disclaimer'

import MetaMaskOnboarding from '@metamask/onboarding'

import Notifs from '@/components/Notifs'
import Tooltip from '@/components/Tooltip'

import { useActiveWeb3React } from '@/hooks/user/index'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { useOptions, useUpdateOptions } from '@/state/options/hooks'
import { useClearNotif } from '@/state/notifs/hooks'
import { useSetLoading } from '@/state/positions/hooks'

import LiquidityTable from '@/components/Liquidity/LiquidityTable'
import numeral from 'numeral'
import { formatEther } from 'ethers/lib/utils'
import isZero from '@/utils/isZero'

import PositionsCard from '@/components/Market/PositionsCard'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = params?.id

  return {
    props: {
      user: data[0],
      data: data,
    },
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

const Liquidity = ({ user, data }) => {
  const [callPutActive, setCallPutActive] = useState(true)
  const { chainId, active, account, library } = useActiveWeb3React()
  const [id, storeId] = useState(chainId)
  const [changing, setChanging] = useState(false)
  const router = useRouter()
  const clear = useClearNotif()
  const options = useOptions()
  const updateOptions = useUpdateOptions()
  const setLoading = useSetLoading()

  useEffect(() => {
    updateOptions('weth')
  }, [user])

  useEffect(() => {
    const { ethereum, web3 } = window as any

    if (MetaMaskOnboarding.isMetaMaskInstalled() && (!ethereum || !web3)) {
      clear(0)
      router.push(`/liquidity`)
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

  if (!active) {
    return (
      <>
        <Spacer />
        <Loader size="lg" />
      </>
    )
  }
  if (!(chainId === 4 || chainId === 1) && active) {
    return <Text>Please switch to Rinkeby or Mainnet Networks</Text>
  }
  if (
    !MetaMaskOnboarding.isMetaMaskInstalled() ||
    !(window as any)?.ethereum ||
    !(window as any)?.web3
  ) {
    return <Text>Please Install Metamask to View Markets</Text>
  }
  if (MetaMaskOnboarding.isMetaMaskInstalled() && !account) {
    return <Text>Please Connect to Metamask to View Markets</Text>
  }

  return (
    <ErrorBoundary
      fallback={
        <>
          <Spacer />
          <Text>Error Loading Liquidity, Please Refresh</Text>
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
          <StyledLitContainer>
            <StyledLitContainerContent>
              <StyledHeaderContainer>
                <DataCard title={'Total Call Liquidity'} multiplier={2}>
                  {!options.loading ? (
                    !isZero(options.reservesTotal[0]) ? (
                      <>
                        {`${numeral(
                          formatEther(options.reservesTotal[0])
                        ).format('0.00a')} ${' '} ${true ? 'weth' : 'DAI'}`}
                      </>
                    ) : (
                      <Tooltip text={`Choose an option and add liquidity!`}>
                        None
                      </Tooltip>
                    )
                  ) : (
                    <>
                      <Loader size="sm" />
                    </>
                  )}
                </DataCard>
                <DataCard title={'Total Put Liquidity'} multiplier={2}>
                  {!options.loading ? (
                    !isZero(options.reservesTotal[1]) ? (
                      <>
                        {`${numeral(
                          formatEther(options.reservesTotal[1])
                        ).format('0.00a')} ${' '} ${'DAI'}`}
                      </>
                    ) : (
                      <Tooltip text={`Choose an option and add liquidity!`}>
                        None
                      </Tooltip>
                    )
                  ) : (
                    <>
                      <Loader size="sm" />
                    </>
                  )}
                </DataCard>
              </StyledHeaderContainer>
              <Spacer />
              <StyledHeaderContainer>
                <LiquidityTable />
              </StyledHeaderContainer>
            </StyledLitContainerContent>
          </StyledLitContainer>
        </>
      )}
    </ErrorBoundary>
  )
}

const StyledLitContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`
const StyledLitContainerContent = styled.div`
  width: ${(props) => props.theme.contentWidth}px;
`

const StyledHeaderContainer = styled.div`
  //background-color: ${(props) => props.theme.color.grey[700]};
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

export default Liquidity
