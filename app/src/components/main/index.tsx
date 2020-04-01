import * as React from 'react'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { LastLocationProvider } from 'react-router-last-location'
import { useWeb3Context } from 'web3-react'

import { ConnectedWeb3, GeoJsProvider, useDocumentTitle } from '../../hooks'
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
import { Header } from '../common/header'
import { MarketHomeContainer } from '../market/market_home_container'
import { MarketRoutes } from '../market/market_routes'
import { MarketWizardCreatorContainer } from '../market/market_wizard_creator_container'
import { IS_CORONA_VERSION } from '../../common/constants'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  const context = useWeb3Context()
  useDocumentTitle(IS_CORONA_VERSION ? 'Corona Information Markets' : 'Conditional Exchange')

  return (
    <GeoJsProvider>
      <ConnectedWeb3>
        <Router>
          <LastLocationProvider>
            <MainWrapper>
              <Header />
              <MainScroll>
                {context.error && <WrongNetworkMessage />}
                {!context.error && (
                  <Switch>
                    <Route component={MarketHomeContainer} exact path="/" />
                    <Route component={MarketWizardCreatorContainer} exact path="/create" />
                    <Route component={MarketRoutes} path="/:address" />
                    <Route component={RedirectToHome} />
                  </Switch>
                )}
              </MainScroll>
            </MainWrapper>
          </LastLocationProvider>
        </Router>
      </ConnectedWeb3>
    </GeoJsProvider>
  )
}
