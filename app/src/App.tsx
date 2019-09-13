import React from 'react'
import Web3Provider from 'web3-react'
import { ThemeProvider } from 'styled-components'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import { CONNECTOR } from './common/constants'
import theme from './theme'
import connectors from './util/connectors'
import { ConnectWallet, ConnectionStatus, MarketWizardCreator } from './components/'

const connector = connectors[CONNECTOR as keyof typeof connectors]

const RedirectToHome = () => <Redirect to="/" />

const App: React.FC = () => {
  const MarketWizardCreatorPage = (props: any) => {
    const callback = (values: any) => {
      alert(`Done! ${JSON.stringify(values)}`)
    }

    return <MarketWizardCreator callback={callback} {...props} />
  }

  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={{ [CONNECTOR]: connector }} libraryName="ethers.js">
        <Router>
          <ConnectWallet />
          <ConnectionStatus />
          <Link to="/create">Create market</Link>
          <Route path="/create" exact component={MarketWizardCreatorPage} />
          <Route component={RedirectToHome} />
        </Router>
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
