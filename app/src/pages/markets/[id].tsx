import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'
import { useWeb3React } from '@web3-react/core'

import Spacer from '@/components/Spacer'
import Button from '@/components/Button'
import Box from '@/components/Box'

import OrderProvider from '@/contexts/Order'
import OptionsProvider from '@/contexts/Options'
import useOrders from '@/hooks/useOrders'
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
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
]

const StyledMain = styled.div`
  background: black;
  width: 70%;
`

const StyledText = styled.div`
  font-size: 18px;
`

const StyledMarket = styled.div`
  display: flex;
  width: 100%;
`

const StyledSideBar = styled.div`
  border-left: 1px solid ${(props) => props.theme.color.grey[600]};
  background: ${(props) => props.theme.color.black};
  box-sizing: border-box;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  padding: ${(props) => props.theme.spacing[4]}px;
  width: 30%;
`
const StyledBox = styled(Box)``

const Market = ({ market }) => {
  const [callPutActive, setCallPutActive] = useState(true)
  // Market Id
  const { marketId } = market

  //**  Web3
  const { chainId, active } = useWeb3React()

  const handleFilter = () => {
    setCallPutActive(!callPutActive)
  }

  if (!(chainId === 4 || chainId === 1) && active) {
    return <h4 style={{ color: 'white' }}>Switch to Rinkeby or Mainnet</h4>
  }
  return (
    <OrderProvider>
      <OptionsProvider>
        <StyledMarket>
          <>
            <StyledMain>
              <MarketHeader marketId={marketId} />
              <FilterBar active={callPutActive} setCallActive={handleFilter} />
              <OptionsTable
                options={mockOptions}
                asset="Ethereum"
                callActive={callPutActive}
              />
            </StyledMain>
            <StyledSideBar>
              <PositionsCard />
              <OrderCard />
              <Spacer />
              <TransactionCard />
            </StyledSideBar>
          </>
        </StyledMarket>
      </OptionsProvider>
    </OrderProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = params?.id

  return {
    props: {
      market: data,
    },
  }
}

export default Market
