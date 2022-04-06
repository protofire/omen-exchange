import React from 'react'
import { Helmet } from 'react-helmet'
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom'
import { useWeb3Context } from 'web3-react'

import { DOCUMENT_TITLE } from '../../common/constants'
import { ProposalDetailsPage } from '../../pages/guild/proposal_details_page'
import { MarketHomeContainer } from '../../pages/market_sections/market_home_container'
import { MarketWizardCreatorContainer } from '../../pages/market_sections/market_wizard_creator_container'
import { MainScroll, MainWrapper, WrongNetworkMessage } from '../common'
import { Footer } from '../common/layout/footer'
import { Header } from '../common/layout/header'
import { ModalAirdropWrapper } from '../modal'
import SettingsViewContainer from '../modal/settings/settings_view'

import { MarketRoutes } from './routes/market_routes'

const RedirectToHome = () => <Redirect to="/" />

export const Main: React.FC = () => {
  const context = useWeb3Context()

  return (
    <>
      <Router>
        <MainWrapper>
          <Header />
          <ModalAirdropWrapper />
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
                <Route component={SettingsViewContainer} exact path="/settings" />
                <Route component={ProposalDetailsPage} exact path="/proposals/:id" />
                <Route
                  component={MarketHomeContainer}
                  path={['/24h-volume', '/volume', '/newest', '/ending', '/liquidity', '/guild']}
                />
                <Route component={MarketWizardCreatorContainer} exact path="/create" />
                <Route component={MarketRoutes} path="/:address" />
                <Route component={RedirectToHome} />
              </Switch>
            )}
          </MainScroll>
          <Footer />
        </MainWrapper>
      </Router>
    </>
  )
}
