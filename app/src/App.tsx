import React from 'react'
import Web3Provider from 'web3-react'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'
import { ApolloProvider } from '@apollo/react-hooks'

import { client } from './apolloClientConfig'
import theme from './theme'
import connectors from './util/connectors'
import { Main } from './components'
import { WalletConnectStylesOverride } from './common/wallet_connect_styles_override'
import { configureStore } from '@reduxjs/toolkit'
import balanceReducer from './store/reducer'
import { Provider } from 'react-redux'

type ThemeType = typeof theme

const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${props => props.theme.colors.mainBodyBackground};
    font-family: ${props => props.theme.fonts.fontFamily};
    font-size: ${props => props.theme.fonts.defaultSize};
  }

  code {
    font-family: ${props => props.theme.fonts.fontFamilyCode};
  }

  body,
  html,
  #root {
    height: 100vh;
  }

  ${WalletConnectStylesOverride}

`
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
