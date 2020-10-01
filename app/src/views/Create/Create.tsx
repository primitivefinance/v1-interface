import React, { useEffect } from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import Page from 'components/Page'
import Spacer from 'components/Spacer'

import OrderProvider from '../../contexts/Order'
import PricesProvider from '../../contexts/Prices'
import OptionsProvider from '../../contexts/Options'
import PositionsProvider from '../../contexts/Positions'

import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

//import CreateCard from './components/CreateCard'

const Create: React.FC = () => {
  // Web3
  const { activate, active, chainId } = useWeb3React()
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  })

  // Connect to web3 automatically using injected
  useEffect(() => {
    if (active) {
      ;(async () => {
        try {
          const injected = new InjectedConnector({
            supportedChainIds: [1, 3, 4, 5, 42],
          })
          await activate(injected)
        } catch (err) {
          console.log(err)
        }
      })()
    }
  }, [active, activate, chainId])

  const handleUnlock = () => {
    activate(injected)
  }

  return (
    <PricesProvider>
      <OrderProvider>
        <OptionsProvider>
          <PositionsProvider>
            <Page>
              <StyledCreate>
                <StyledMain>
                  {active ? (
                    chainId === 4 ? (
                      <>
                        <WaitingRoom>
                          {' '}
                          Primitive is permissionless; anyone can create new
                          Oracle-less options from the protocol's factory. The
                          interface for this is being built.{' '}
                        </WaitingRoom>
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
                      <Button
                        text="Connect Wallet"
                        onClick={handleUnlock}
                      />{' '}
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
                </StyledMain>
              </StyledCreate>
            </Page>
          </PositionsProvider>
        </OptionsProvider>
      </OrderProvider>
    </PricesProvider>
  )
}

const StyledMain = styled.div`
  font-size: 36px;
`

const StyledText = styled.div`
  font-size: 18px;
`

const StyledCreate = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
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

export default Create