import * as React from 'react'
import { CONNECTOR } from '../../common/constants'
import { ConnectedWeb3 } from '../../hooks/connectedWeb3'
import { Footer } from '../common/footer'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Header } from '../common/header'
import { Home, MarketWizardCreatorContainer, MarketViewContainer } from '../index'
import { MainScroll } from '../common/main_scroll'
import { MainWrapper } from '../common/main_wrapper'
import { useWeb3Context } from 'web3-react'

const ConnectWeb3 = () => {
  const context = useWeb3Context()

  React.useEffect(() => {
    context.setConnector(CONNECTOR)
  }, [context])

  return <></>
}

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
              <Switch>
                <Route path="/create" exact component={MarketWizardCreatorContainer} />
                <Route path="/view/:address" exact component={MarketViewContainer} />
              </Switch>
            </ConnectedWeb3>
          </Switch>
          <Route path="/view/:address" exact component={ConnectWeb3} />
          <Footer />
        </MainScroll>
      </MainWrapper>
    </Router>
  )
}
