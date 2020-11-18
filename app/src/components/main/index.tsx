import { useWeb3React } from '@web3-react/core'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'

import {
  DOCUMENT_DESCRIPTION,
  DOCUMENT_TITLE,
  OG_DESCRIPTION,
  OG_IMAGE,
  OG_SITE_NAME,
  OG_TITLE,
  OG_URL,
  TWITTER_CARD,
  TWITTER_IMAGE_ALT,
  TWITTER_SITE,
} from '../../common/constants'
import connectors from '../../util/connectors'
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
import { Disclaimer } from '../common/disclaimer'
import { Footer } from '../common/layout/footer'
import { Header } from '../common/layout/header'
import { MarketRoutes } from '../market/routes/market_routes'
import { MarketWizardCreatorContainer } from '../market/sections/market_create/market_wizard_creator_container'
import { MarketHomeContainer } from '../market/sections/market_list/market_home_container'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  const context = useWeb3React()
  const { activate } = context
  React.useEffect(() => {
    activate(connectors.Infura)
  }, [activate])

  return (
    <Router>
      <MainWrapper>
        <Helmet>
          <title>{DOCUMENT_TITLE}</title>
          <meta content={DOCUMENT_DESCRIPTION} name="description" />
          <meta content={OG_TITLE} property="og:title" />
          <meta content={OG_DESCRIPTION} property="og:description" />
          <meta content={`/${OG_IMAGE}`} property="og:image" />
          <meta content={OG_URL} property="og:url" />
          <meta content={OG_SITE_NAME} property="og:site_name" />
          <meta content={TWITTER_CARD} name="twitter:card" />
          <meta content={TWITTER_IMAGE_ALT} name="twitter:image:alt" />
          <meta content={TWITTER_SITE} name="twitter:site" />
          <link href={`${OG_IMAGE}`} rel="icon" type="image/png" />
        </Helmet>
        <Header />
        <MainScroll>
          {context.error && <WrongNetworkMessage />}
          {!context.error && (
            <Switch>
              <Route exact path="/">
                <Redirect to="/liquidity" />
              </Route>
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
        <Disclaimer />
      </MainWrapper>
    </Router>
  )
}
