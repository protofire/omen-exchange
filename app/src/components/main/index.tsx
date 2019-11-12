import * as React from 'react'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { Footer } from '../common/footer'
import { CreateMarketPage } from '../../pages'
import { Header } from '../common/header'
import { MainScroll } from '../common/main_scroll'
import { MainWrapper } from '../common/main_wrapper'
import { MarketRoutes } from '../market/market_routes'
import { MarketHomePage } from '../../pages/market_home_page'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  return (
    <Router>
      <MainWrapper>
        <Header />
        <MainScroll>
          <Switch>
            <Route exact path="/" component={MarketHomePage} />
            <Route exact path="/create" component={CreateMarketPage} />
            <Route path="/:address" component={MarketRoutes} />
            <Route component={RedirectToHome} />
          </Switch>
          <Footer />
        </MainScroll>
      </MainWrapper>
    </Router>
  )
}
