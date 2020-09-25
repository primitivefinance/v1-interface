import React from 'react'
import styled from 'styled-components'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

import Button from '../../components/Button'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import MarketCards from './components/MarketCards'
import Market from '../Market'

import greek from '../../assets/img/greek.svg'

const Markets: React.FC = () => {
  const { path } = useRouteMatch()
  const { account, activate } = useWeb3React()
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  })

  const handleConnect = () => {
    activate(injected)
  }

  return (
    <Switch>
      <Page>
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader
                icon={<img src={greek} height="96" alt={'markets page icon'} />}
                subtitle="Oracle-less options."
                title="Select an option market."
              />
              <MarketCards />
            </Route>
            <Route path={`${path}/:marketId`}>
              <Market />
            </Route>
          </>
        ) : (
          <StyledButtonContainer>
            <Button onClick={handleConnect} text="Unlock Wallet" />
          </StyledButtonContainer>
        )}
      </Page>
    </Switch>
  )
}

const StyledButtonContainer = styled.div`
  align-items: 'center';
  display: 'flex';
  flex: 1;
  justify-content: 'center';
`

export default Markets
