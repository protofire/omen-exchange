import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import { Provider } from 'react-redux'
import Web3Provider from 'web3-react'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'
import { Main } from './components/main'
import { ConnectedWeb3 } from './contexts'
import { ApolloProviderWrapper } from './contexts/Apollo'
import balanceReducer from './store/reducer'
import { ThemeProvider } from './theme'
import { GlobalStyle } from './theme/global_style'
import connectors from './util/connectors'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        <ConnectedWeb3>
          <ApolloProviderWrapper>
            <Provider store={store}>
              <GlobalStyle />
              <Main />
            </Provider>
          </ApolloProviderWrapper>
        </ConnectedWeb3>
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
