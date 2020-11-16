import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'
import { useActiveWeb3React } from '@/hooks/user/index'

import BetaBanner from '@/components/BetaBanner'
import Spacer from '@/components/Spacer'

import { ADDRESS_FOR_MARKET } from '@/constants/index'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import { useClearNotif } from '@/state/notifs/hooks'

import {
  FilterBar,
  MarketHeader,
  OptionsTable,
  TransactionCard,
  OrderCard,
  PositionsCard,
  NewMarketCard,
} from '@/components/Market'
import TestnetCard from '@/components/Market/TestnetCard/TestnetCard'

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

  const router = useRouter()
  const clear = useClearNotif()
  useEffect(() => {
    const { ethereum } = window as any
    if (!ethereum) {
      clear(0)
      router.push('/markets')
    }
    const handleChainChanged = () => {
      // eat errors
      clear(0)
      router.reload()
    }

    ethereum?.on('chainChanged', handleChainChanged)
    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  })
  const handleFilterType = () => {
    setCallPutActive(!callPutActive)
  }
  const handleFilterExpiry = (exp: number) => {
    setExpiry(exp)
  }

  if (!active) {
    return <StyledText>Please install Metamask</StyledText>
  }
  if (!(chainId === 4 || chainId === 1) && active) {
    return <StyledText>Please switch to Rinkeby or Mainnet Networks</StyledText>
  }
  return (
    <ErrorBoundary fallback={'Error Loading Market'}>
      <StyledMarket>
        <Grid>
          <Row>
            <StyledContainer sm={12} md={8} lg={8}>
              <StyledMain>
                <MarketHeader marketId={market} />
                <FilterBar
                  active={callPutActive}
                  setCallActive={handleFilterType}
                  expiry={expiry}
                  setExpiry={handleFilterExpiry}
                />
                <OptionsTable
                  asset={market}
                  assetAddress={ADDRESS_FOR_MARKET[market]}
                  optionExp={expiry}
                  callActive={callPutActive}
                />
              </StyledMain>
            </StyledContainer>

            <Col sm={12} md={4} lg={4}>
              <StyledSideBar>
                <BetaBanner isOpen={true} />
                <Spacer size="sm" />
                {chainId === 4 ? (
                  <>
                    <TestnetCard />
                  </>
                ) : (
                  <> </>
                )}
                <Spacer size="sm" />
                <PositionsCard />
                <OrderCard orderState={data} />
                <NewMarketCard />
                <Spacer />
                <TransactionCard />
              </StyledSideBar>
            </Col>
          </Row>
        </Grid>
      </StyledMarket>
    </ErrorBoundary>
  )
}

const StyledContainer = styled(Col)`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`
const StyledMain = styled.div``

const StyledMarket = styled.div`
  width: 100%;
`

const StyledSideBar = styled.div`
  background: ${(props) => props.theme.color.black};
  border-left: 1px solid ${(props) => props.theme.color.grey[600]};
  box-sizing: border-box;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  padding: ${(props) => props.theme.spacing[4]}px 0
    ${(props) => props.theme.spacing[4]}px
    ${(props) => props.theme.spacing[4]}px;
  padding-top: 0 !important;
  width: 100%;
`
const StyledText = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
`

export default Market
