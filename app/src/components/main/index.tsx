import * as React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { Home, MarketWizardCreatorContainer, MarketViewContainer } from '../index'
import { Header } from '../common/header'
import { ConnectedWeb3 } from '../../hooks/connectedWeb3'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  return (
    <div className="container">
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <ConnectedWeb3>
            <Switch>
              <Route path="/create" exact component={MarketWizardCreatorContainer} />
              <Route path="/view/:address" exact component={MarketViewContainer} />
            </Switch>
          </ConnectedWeb3>
          <Route component={RedirectToHome} />
        </Switch>
      </Router>
    </div>
  )
}
