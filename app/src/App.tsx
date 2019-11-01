import React from 'react'
import Web3Provider from 'web3-react'
import { ThemeProvider } from 'styled-components'

import theme from './theme'
import connectors from './util/connectors'
import { Main } from './components'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        <Main />
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
