import * as React from 'react'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { Footer } from '../common/footer'
import { Header } from '../common/header'
import { MainScroll } from '../common/main_scroll'
import { MainWrapper } from '../common/main_wrapper'
import { MarketRoutes } from '../market/market_routes'
import { ConnectedWeb3 } from '../../hooks/connectedWeb3'
import { MarketWizardCreatorContainer } from '../market/market_wizard_creator_container'
import { MarketHomeContainer } from '../market/market_home_container'
import { NewDesign } from '../new_design/index'
import { useWeb3Context } from 'web3-react'
import { WrongNetworkMessage } from '../common/wrong_network_message'

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
                <Route exact path="/" component={MarketHomeContainer} />
                <Route exact path="/new-design" component={NewDesign} />
                <Route exact path="/create" component={MarketWizardCreatorContainer} />
                <Route path="/:address" component={MarketRoutes} />
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
