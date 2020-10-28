import React, { useState } from 'react'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'
import { useWeb3React } from '@web3-react/core'

import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import OrderProvider from '@/contexts/Order'
import OptionsProvider from '@/contexts/Options'

import {
  FilterBar,
  MarketHeader,
  OptionsTable,
  TransactionCard,
  OrderCard,
  PositionsCard,
} from '../../components/Market'

const mockOptions = [
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
]

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = params?.id

  return {
    props: {
      market: data,
    },
  }
}

const Market = ({ market }) => {
  const [callPutActive, setCallPutActive] = useState(true)
  const [expiry, setExpiry] = useState(1609286400)
  const { chainId, active } = useWeb3React()
  const { marketId } = market

  const handleFilterType = () => {
    setCallPutActive(!callPutActive)
  }

  const handleFilterExpiry = (exp: number) => {
    setExpiry(exp)
  }
  if (!(chainId === 4 || chainId === 1) && active) {
    return <StyledText>Switch to Rinkeby or Mainnet</StyledText>
  }
  return (
    <OrderProvider>
      <OptionsProvider>
        <StyledMarket>
          <StyledMain>
            <MarketHeader marketId={marketId} />
            <FilterBar
              active={callPutActive}
              setCallActive={handleFilterType}
              expiry={expiry}
              setExpiry={handleFilterExpiry}
            />
            <OptionsTable
              options={mockOptions}
              asset="Ethereum"
              optionExp={expiry}
              callActive={callPutActive}
            />
          </StyledMain>
          <StyledSideBar>
            <PositionsCard asset="ethereum" />
            <OrderCard />
            <Spacer />
            <TransactionCard />
          </StyledSideBar>
        </StyledMarket>
      </OptionsProvider>
    </OrderProvider>
  )
}

const StyledMain = styled.div`
  flex: 0.7;
`

const StyledMarket = styled.div`
  display: flex;
  flex-direction: row;
  justify-contet: center;
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
  width: ${(props) => props.theme.sidebarWidth}%;
`
const StyledText = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
`

export default Market
