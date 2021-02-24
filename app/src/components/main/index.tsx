import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { useWeb3Context } from 'web3-react'

import {
  DISCLAIMER_TEXT,
  DOCUMENT_DESCRIPTION,
  DOCUMENT_TITLE,
  MAINNET_LOCATION,
  MAIN_NETWORKS,
  OG_DESCRIPTION,
  OG_IMAGE,
  OG_SITE_NAME,
  OG_TITLE,
  OG_URL,
  TWITTER_CARD,
  TWITTER_IMAGE_ALT,
  TWITTER_SITE,
  XDAI_LOCATION,
  XDAI_NETWORKS,
} from '../../common/constants'
import { useXdaiBridge } from '../../hooks/useXdaiBridge'
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
import { ClaimDaiModal } from '../common/claim_dai_modal'
import { Disclaimer } from '../common/disclaimer'
import { Footer } from '../common/layout/footer'
import { Header } from '../common/layout/header'
import { SwitchNetworkModal } from '../common/switch_network_modal'
import { MarketRoutes } from '../market/routes/market_routes'
import { MarketWizardCreatorContainer } from '../market/sections/market_create/market_wizard_creator_container'
import { MarketHomeContainer } from '../market/sections/market_list/market_home_container'

const RedirectToHome = () => <Redirect to="/" />
export const Main: React.FC = () => {
  const context = useWeb3Context()
  const windowObj: any = window
  const [claimState, setClaimState] = useState(false)

  const host = window.location.hostname
  let defaultChainID = 1
  if (host === XDAI_LOCATION) {
    defaultChainID = 100
  }
  const [networkId, setNetworkId] = useState(windowObj.ethereum ? windowObj.ethereum.chainId : defaultChainID)
  const [wrongNetwork, setWrongNetwork] = useState(false)
  const { unclaimedAmount } = useXdaiBridge()

  if (windowObj.ethereum) {
    windowObj.ethereum.on('chainChanged', (chainId: string) => {
      setNetworkId(chainId)
      if (location.host === MAINNET_LOCATION && XDAI_NETWORKS.includes(chainId)) {
        location.assign(`http://${XDAI_LOCATION}`)
      }
      if (location.host === XDAI_LOCATION && MAIN_NETWORKS.includes(chainId)) {
        location.assign(`http://${MAINNET_LOCATION}`)
      }
    })
  }

  useEffect(() => {
    if (networkId) {
      setWrongNetwork(
        (location.host === MAINNET_LOCATION && XDAI_NETWORKS.includes(networkId)) ||
          (location.host === XDAI_LOCATION && MAIN_NETWORKS.includes(networkId)),
      )
    }
  }, [networkId])

  return (
    <>
      {wrongNetwork && <SwitchNetworkModal currentNetworkId={networkId} />}
      {claimState && <ClaimDaiModal setClaim={setClaimState} unclaimedAmount={unclaimedAmount}></ClaimDaiModal>}
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
          <Header setClaim={setClaimState} />
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
          {DISCLAIMER_TEXT.length > 0 && <Disclaimer />}
        </MainWrapper>
      </Router>
    </>
  )
}
