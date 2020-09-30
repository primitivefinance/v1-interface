import React from 'react'
import ethers from 'ethers'
import { ThemeProvider } from 'styled-components'
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { Web3ReactProvider } from '@web3-react/core'

import TopBar from 'components/TopBar'
import Footer from 'components/Footer'

import Markets from './views/Markets'
import Portfolio from './views/Portfolio'
import Create from './views/Create'

import MarketsProvider from './contexts/Markets'

import theme from './theme'

function getLibrary(provider, connector) {
  return new ethers.providers.Web3Provider(provider)
}

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <MarketsProvider>
          <Router basename="/">
            <TopBar />
            <Switch>
              <Route exact path="/">
                <Redirect to="/markets" />
              </Route>
            </Switch>
            <Switch>
              <Route path="/markets" component={Markets} />
            </Switch>
            <Switch>
              <Route path="/portfolio" component={Portfolio} />
            </Switch>
            <Switch>
              <Route exact path="/create" component={Create} />
            </Switch>
            <Footer />
          </Router>
        </MarketsProvider>
      </Web3ReactProvider>
    </ThemeProvider>
  )
}

export default App
