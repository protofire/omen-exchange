import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { useWeb3Context } from 'web3-react'

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
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
import { Disclaimer } from '../common/disclaimer'
import { Footer } from '../common/layout/footer'
import { Header } from '../common/layout/header'
import { MarketRoutes } from '../market/routes/market_routes'
import { MarketWizardCreatorContainer } from '../market/sections/market_create/market_wizard_creator_container'
import { MarketHomeContainer } from '../market/sections/market_list/market_home_container'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  const context = useWeb3Context()

  const [networkId, setNetworkId] = useState(context.networkId && context.networkId.toString())

  // Includes Mainnet and Rinkeby
  const mainNetworks = ['1', '0x1', '4', '0x4']
  // Includes xDai and Sokol
  const xDaiNetworks = ['100', '0x64', '77', '0x4d']

  const windowObj: any = window
  windowObj.ethereum.on('chainChanged', (chainId: string) => {
    setNetworkId(chainId)
    // TODO: Set host to omen.eth.link
    if (location.host === 'localhost:3000' && xDaiNetworks.includes(chainId)) {
      // TODO: Redirect to xdai.omen.eth.link
      console.log('switch domain to xdai domain')
    }
    // TODO: Set host to xdai.omen.eth.link
    if (location.host === 'localhost:3000' && mainNetworks.includes(chainId)) {
      // TODO: Redirect to omen.eth.link
      console.log('switch domain to mainnet domain')
    }
  })

  useEffect(() => {
    if (networkId) {
      console.log(networkId)
      // TODO: Change host to omen.eth.link
      if (location.host === 'localhost:3000' && xDaiNetworks.includes(networkId)) {
        // TODO: Return warning component
        return console.log('Wrong network, switch to mainnet')
      }
      // TODO: Change host to xdai.omen.eth.link
      if (location.host === 'localhost:3000' && mainNetworks.includes(networkId)) {
        // TODO: Return warning component
        return console.log('Wrong network, switch to xDai')
      }
    }
  }, [networkId, mainNetworks, xDaiNetworks])

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
