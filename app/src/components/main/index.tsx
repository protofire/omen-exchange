import * as React from 'react'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { Footer } from '../common/footer'
import {
  CreateMarketPage,
  MarketDetailsPage,
  MarketFundPage,
  MarketBuyPage,
  MarketSellPage,
} from '../../pages'
import { Header } from '../common/header'
import { MainScroll } from '../common/main_scroll'
import { MainWrapper } from '../common/main_wrapper'
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
            <Route exact path="/:address" component={MarketDetailsPage} />
            <Route exact path="/:address/buy" component={MarketBuyPage} />
            <Route exact path="/:address/sell" component={MarketSellPage} />
            <Route exact path="/:address/fund" component={MarketFundPage} />
            <Route component={RedirectToHome} />
          </Switch>
          <Footer />
        </MainScroll>
      </MainWrapper>
    </Router>
  )
}
