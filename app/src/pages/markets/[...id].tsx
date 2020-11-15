import React, { useState, useEffect } from 'react'
import Router from 'next/router'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'
import { useWeb3React } from '@web3-react/core'

import BetaBanner from '@/components/BetaBanner'
import Spacer from '@/components/Spacer'

import { ADDRESS_FOR_MARKET } from '@/constants/index'
import ErrorBoundary from '@/components/ErrorBoundary'

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
  const { chainId, active } = useWeb3React()

  const handleFilterType = () => {
    setCallPutActive(!callPutActive)
  }
  const handleFilterExpiry = (exp: number) => {
    setExpiry(exp)
  }

  if (!(chainId === 4 || chainId === 1) && active) {
    return <StyledText>Please switch to Rinkeby or Mainnet Networks</StyledText>
  }
  return (
    <ErrorBoundary fallback={'Error Loading Market'}>
      <StyledMarket>
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
      </StyledMarket>
    </ErrorBoundary>
  )
}

const StyledMain = styled.div`
  flex: 0.7;
`

const StyledMarket = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: start;
  width: ${(props) => props.theme.tableWidth}%;
`

const StyledSideBar = styled.div`
  background: ${(props) => props.theme.color.black};
  border-left: 1px solid ${(props) => props.theme.color.grey[600]};
  box-sizing: border-box;
  flex: 0.3;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  padding: ${(props) => props.theme.spacing[4]}px;
  padding-top: 0 !important;
  width: ${(props) => props.theme.sidebarWidth}%;
`
const StyledText = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
`

export default Market
