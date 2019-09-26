import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Home, MarketWizardCreatorContainer, MarketViewContainer } from '../index'
import { Header } from '../common/header'
import { MainScroll } from '../common/main_scroll'
import { Footer } from '../common/footer'
import { MainWrapper } from '../common/main_wrapper'
import { ConnectedWeb3 } from '../../hooks/connectedWeb3'

export const Main: React.FC = () => {
  return (
    <Router>
      <MainWrapper>
        <Header />
        <MainScroll>
          <Switch>
            <Route exact path="/home" component={Home} />
            <Route exact path="/">
              <Redirect
                to={{
                  pathname: '/home',
                }}
              />
            </Route>
            <ConnectedWeb3>
              <Route exact path="/create" component={MarketWizardCreatorContainer} />
              <Route exact path="/view/:address" component={MarketViewContainer} />
            </ConnectedWeb3>
          </Switch>
          <Footer />
        </MainScroll>
      </MainWrapper>
    </Router>
  )
}
