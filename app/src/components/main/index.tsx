import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { useWeb3Context } from 'web3-react'

import { DISCLAIMER_TEXT, DOCUMENT_TITLE } from '../../common/constants'
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
import { Disclaimer } from '../common/disclaimer'
import { Footer } from '../common/layout/footer'
import { Header } from '../common/layout/header'
import { MarketRoutes } from '../market/routes/market_routes'
import { MarketWizardCreatorContainer } from '../market/sections/market_create/market_wizard_creator_container'
import { MarketHomeContainer } from '../market/sections/market_list/market_home_container'
import SettingsViewContainer from '../settings/settings_view'
const RedirectToHome = () => <Redirect to="/" />
export const Main: React.FC = () => {
  const context = useWeb3Context()

  const windowObj: any = window
  const defaultChainID = 1
  const [networkId, setNetworkId] = useState(windowObj.ethereum ? windowObj.ethereum.chainId : defaultChainID)

  if (windowObj.ethereum) {
    windowObj.ethereum.on('chainChanged', (chainId: string) => setNetworkId(chainId))
  }

  return (
    <>
      <Router>
        <MainWrapper>
          <Header />
          <Helmet>
            <title>{DOCUMENT_TITLE}</title>
          </Helmet>
          <MainScroll>
            {context.error && <WrongNetworkMessage />}
            {!context.error && (
              <Switch>
                <Route exact path="/">
                  <Redirect to="/liquidity" />
                </Route>
                <Route
                  exact
                  path="/settings"
                  render={props => <SettingsViewContainer networkId={networkId} {...props} />}
                />
                <Route component={MarketHomeContainer} path="/24h-volume" />
                <Route component={MarketHomeContainer} path="/volume" />
                <Route component={MarketHomeContainer} path="/newest" />
                <Route component={MarketHomeContainer} path="/ending" />
                <Route component={MarketHomeContainer} path="/liquidity" />
                <Route component={MarketWizardCreatorContainer} exact path="/create" />
                <Route component={MarketRoutes} path="/:address" />
                <Route component={RedirectToHome} />
              </Switch>
            )}
          </MainScroll>
          <Footer />
          {DISCLAIMER_TEXT.length > 0 && <Disclaimer />}
        </MainWrapper>
      </Router>
    </>
  )
}
