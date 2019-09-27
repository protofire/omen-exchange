import * as React from 'react'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { Home } from '../index'
import { CreateMarketPage, MarketDetailsPage } from '../../pages'
import { Header } from '../common/header'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  return (
    <div className="container">
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/create" component={CreateMarketPage} />
          <Route exact path="/view/:address" component={MarketDetailsPage} />
          <Route component={RedirectToHome} />
        </Switch>
      </Router>
    </div>
  )
}
