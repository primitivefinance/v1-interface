import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'

import Spacer from 'components/Spacer'
import Button from 'components/Button'

import OrderProvider from '../../contexts/Order'
import PricesProvider from '../../contexts/Prices'
import OptionsProvider from '../../contexts/Options'
import PositionsProvider from '../../contexts/Positions'

import { FilterBar, MarketHeader, OptionsTable, PositionsTable, OrderCard, TestnetCard, PositionsHeader } from '../../components/Market'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

const mockOptions = [
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
  { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
]

const StyledMain = styled.div``

const StyledText = styled.div`
  font-size: 18px;
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

const StyledMarket = styled.div`
  display: flex;
  width: 100%;
`

const StyledSideBar = styled.div`
  border-left: 1px solid ${(props) => props.theme.color.grey[600]};
  box-sizing: border-box;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  padding: ${(props) => props.theme.spacing[4]}px;
  width: 400px;
`

const Market = ({market}) => {
  const [callPutActive, setCallPutActive] = useState(true)

  // Market Id
  const { marketId } = market

  // Web3
  const { activate, chainId, active } = useWeb3React()
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  })

  // Connect to web3 automatically using injected
  useEffect(() => {
    if (active) {
      ;(async () => {
        const injected = new InjectedConnector({
          supportedChainIds: [1, 3, 4, 5, 42],
        })
        try {
          await activate(injected)
        } catch (err) {
          console.log(err)
        }
      })()
    }
  }, [active, activate, chainId])

  const handleFilter = () => {
    setCallPutActive(!callPutActive)
  }

  const handleUnlock = () => {
    activate(injected)
  }

  return (
    <PricesProvider>
      <OrderProvider>
        <OptionsProvider>
          <PositionsProvider>
            <StyledMarket>
              {active ? (
                chainId === 4 ? (
                  <>
                    <StyledMain>
                      <MarketHeader marketId={marketId} />
                      <FilterBar
                        active={callPutActive}
                        setCallActive={handleFilter}
                      />
                      <OptionsTable
                        options={mockOptions}
                        asset="Ethereum"
                        callActive={callPutActive}
                      />
                      <PositionsHeader name="Ethereum" symbol="ETH" />
                      <PositionsTable
                        positions={mockOptions}
                        asset="Ethereum"
                        callActive={callPutActive}
                      />
                    </StyledMain>
                    <StyledSideBar>
                      <OrderCard />
                      <Spacer />
                      {chainId === 4 ? <TestnetCard /> : <> </>}
                    </StyledSideBar>{' '}
                  </>
                ) : (
                  <WaitingRoom>
                    {' '}
                    Please connect to the Rinkeby test network.{' '}
                  </WaitingRoom>
                )
              ) : (
                <WaitingRoom>
                  <Spacer size="lg" />
                  <Button text="Connect Wallet" onClick={handleUnlock} />{' '}
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
                  />{' '}
                  <Spacer />
                </WaitingRoom>
              )}
            </StyledMarket>
          </PositionsProvider>
        </OptionsProvider>
      </OrderProvider>
    </PricesProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const data = params?.id

  return {
    props: {
      market: data
    }
  }
}

export default Market