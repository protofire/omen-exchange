import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { LastLocationProvider } from 'react-router-last-location'
import { useWeb3Context } from 'web3-react'

import {
  DOCUMENT_DESCRIPTION,
  DOCUMENT_TITLE,
  IS_CORONA_VERSION,
  OG_DESCRIPTION,
  OG_IMAGE,
  OG_SITE_NAME,
  OG_TITLE,
  OG_URL,
  TWITTER_CARD,
  TWITTER_IMAGE_ALT,
  TWITTER_SITE,
} from '../../common/constants'
import { GeoJsProvider } from '../../hooks'
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
import { Header } from '../common/header'
import { MarketHomeContainer } from '../market/market_home_container'
import { MarketRoutes } from '../market/market_routes'
import { MarketWizardCreatorContainer } from '../market/market_wizard_creator_container'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  const context = useWeb3Context()
  const CONTEXT_OG_IMAGE = IS_CORONA_VERSION ? `corona_${OG_IMAGE}` : OG_IMAGE

  return (
    <GeoJsProvider>
      <Router>
        <LastLocationProvider>
          <MainWrapper>
            <Helmet>
              <title>{DOCUMENT_TITLE}</title>
              <meta content={DOCUMENT_DESCRIPTION} name="description" />
              <meta content={OG_TITLE} property="og:title" />
              <meta content={OG_DESCRIPTION} property="og:description" />
              <meta content={`/${CONTEXT_OG_IMAGE}`} property="og:image" />
              <meta content={OG_URL} property="og:url" />
              <meta content={OG_SITE_NAME} property="og:site_name" />
              <meta content={TWITTER_CARD} name="twitter:card" />
              <meta content={TWITTER_IMAGE_ALT} name="twitter:image:alt" />
              <meta content={TWITTER_SITE} name="twitter:site" />
              <link href={`${CONTEXT_OG_IMAGE}`} rel="icon" type="image/png" />
            </Helmet>
            <Header />
            <MainScroll>
              {context.error && <WrongNetworkMessage />}
              {!context.error && (
                <Switch>
                  <Route component={MarketHomeContainer} exact path="/" />
                  <Route component={MarketWizardCreatorContainer} exact path="/create" />
                  <Route component={MarketRoutes} path="/:address" />
                  <Route component={RedirectToHome} />
                </Switch>
              )}
            </MainScroll>
          </MainWrapper>
        </LastLocationProvider>
      </Router>
    </GeoJsProvider>
  )
}
