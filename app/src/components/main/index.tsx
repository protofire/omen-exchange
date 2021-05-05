import React, { useEffect, useState } from 'react'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { useWeb3Context } from 'web3-react'

import { DISCLAIMER_TEXT, MAINNET_LOCATION, MAIN_NETWORKS, XDAI_LOCATION, XDAI_NETWORKS } from '../../common/constants'
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
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
  const host = window.location.hostname
  let defaultChainID = 1
  if (host === XDAI_LOCATION) {
    defaultChainID = 100
  }
  const [networkId, setNetworkId] = useState(windowObj.ethereum ? windowObj.ethereum.chainId : defaultChainID)
  const [wrongNetwork, setWrongNetwork] = useState(false)

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
        (context.connectorName !== 'Safe' && location.host === MAINNET_LOCATION && XDAI_NETWORKS.includes(networkId)) ||
          (context.connectorName !== 'Safe' && location.host === XDAI_LOCATION && MAIN_NETWORKS.includes(networkId)),
      )
    }
  }, [networkId, context.connectorName])

  return (
    <>
      {wrongNetwork && <SwitchNetworkModal currentNetworkId={networkId} />}
      <Router>
        <MainWrapper>
          <Header />
          <MainScroll>
            {context.error && <WrongNetworkMessage />}
            {!context.error && (
              <Switch>
                <Route exact path="/">
                  <Redirect to="/liquidity" />
                </Route>
                {/*<Route component={() => <SettingsWithRouter />} exact networkId={networkId} path="/settings" />*/}

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
