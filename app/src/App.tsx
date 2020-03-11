import { ApolloProvider } from '@apollo/react-hooks'
import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import Web3Provider from 'web3-react'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'

import { client } from './apolloClientConfig'
import { Main } from './components/main'
import balanceReducer from './store/reducer'
import theme from './theme'
import { GlobalStyle } from './theme/component_styles/global_style'
import connectors from './util/connectors'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <Web3Provider connectors={connectors} libraryName="ethers.js">
          <Provider store={store}>
            <GlobalStyle />
            <Main />
          </Provider>
        </Web3Provider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
