import React from 'react'
import Web3Provider from 'web3-react'
import { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import { CONNECTOR } from './common/constants'
import { ConnectedWeb3 } from './hooks/connectedWeb3'
import theme from './theme'
import connectors from './util/connectors'
import { ConnectWallet, ConnectionStatus, MarketWizardCreatorContainer } from './components/'

const connector = connectors[CONNECTOR as keyof typeof connectors]

const RedirectToHome = () => <Redirect to="/" />

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={{ [CONNECTOR]: connector }} libraryName="ethers.js">
        <Router>
          <ConnectWallet />
          <ConnectedWeb3>
            <ConnectionStatus />
          </ConnectedWeb3>
          <Link to="/create">Create market</Link>
          <Route path="/create" exact component={MarketWizardCreatorContainer} />
          <Route component={RedirectToHome} />
        </Router>
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
