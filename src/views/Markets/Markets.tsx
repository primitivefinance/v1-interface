import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import MarketCards from './components/MarketCards'
import Market from '../Market'

import greek from '../../assets/img/greek.svg'

const Markets: React.FC = () => {
  const { path } = useRouteMatch()

  return (
    <Switch>
      <Page>
        <Route exact path={path}>
          <PageHeader
            icon={
              <img
                src={greek}
                style={{ filter: 'invert(1)' }}
                height="72"
                alt={'markets page icon'}
              />
            }
            subtitle="Oracle-less options."
            title="Select an option market."
          />
          <MarketCards />
        </Route>
        <Route path={`${path}/:marketId`}>
          <Market />
        </Route>
      </Page>
    </Switch>
  )
}

export default Markets
