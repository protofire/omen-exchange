import * as React from 'react'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { useWeb3Context } from 'web3-react'

import { ConnectedWeb3 } from '../../hooks/connectedWeb3'
import { Footer } from '../common/footer'
import { Header } from '../common/header'
import { MainScroll } from '../common/main_scroll'
import { MainWrapper } from '../common/main_wrapper'
import { WrongNetworkMessage } from '../common/wrong_network_message'
import { MarketHomeContainer } from '../market/market_home_container'
import { MarketRoutes } from '../market/market_routes'
import { MarketWizardCreatorContainer } from '../market/market_wizard_creator_container'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  const context = useWeb3Context()

  return (
    <ConnectedWeb3>
      <Router>
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
            <Footer />
          </MainScroll>
        </MainWrapper>
      </Router>
    </ConnectedWeb3>
  )
}
