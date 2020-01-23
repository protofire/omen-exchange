import * as React from 'react'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import queryString from 'query-string'

import { Footer } from '../common/footer'
import { Header } from '../common/header'
import { MainScroll } from '../common/main_scroll'
import { MainWrapper } from '../common/main_wrapper'
import { MarketRoutes, MarketValidation } from '../market/market_routes'
import { ConnectedWeb3 } from '../../hooks/connectedWeb3'
import { MarketWizardCreatorContainer } from '../market/market_wizard_creator_container'
import { MarketHomeContainer } from '../market/market_home_container'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  const parsed = queryString.parse(window.location.search)

  if (parsed.market) {
    return (
      <ConnectedWeb3>
        <Router>
          <MainWrapper>
            <Header />
            <MainScroll>
              <MarketValidation marketMakerAddress={parsed.market as any} card={true} />
              <Footer />
            </MainScroll>
          </MainWrapper>
        </Router>
      </ConnectedWeb3>
    )
  }

  return (
    <ConnectedWeb3>
      <Router>
        <MainWrapper>
          <Header />
          <MainScroll>
            <Switch>
              <Route exact path="/" component={MarketHomeContainer} />
              <Route exact path="/create" component={MarketWizardCreatorContainer} />
              <Route path="/:address" component={MarketRoutes} />
              <Route component={RedirectToHome} />
            </Switch>
            <Footer />
          </MainScroll>
        </MainWrapper>
      </Router>
    </ConnectedWeb3>
  )
}
