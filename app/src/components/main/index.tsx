import * as React from 'react'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Footer } from '../common/footer'
import { Home } from '../index'
import { CreateMarketPage, MarketDetailsPage, MarketFundPage } from '../../pages'
import { Header } from '../common/header'
import { MainScroll } from '../common/main_scroll'
import { MainWrapper } from '../common/main_wrapper'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  return (
    <Router>
      <MainWrapper>
        <Header />
        <MainScroll>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/create" component={CreateMarketPage} />
            <Route exact path="/view/:address" component={MarketDetailsPage} />
            <Route exact path="/fund/:address" component={MarketFundPage} />
            <Route component={RedirectToHome} />
          </Switch>
          <Footer />
        </MainScroll>
      </MainWrapper>
    </Router>
  )
}
