import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import Web3Provider from 'web3-react'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'

import { Main } from './components/main'
import { ApolloProviderWrapper } from './contexts/Apollo'
import { ConnectedWeb3 } from './hooks'
import balanceReducer from './store/reducer'
import theme from './theme'
import { GlobalStyle } from './theme/component_styles/global_style'
import connectors from './util/connectors'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
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
