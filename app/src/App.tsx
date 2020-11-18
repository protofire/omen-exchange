import { configureStore } from '@reduxjs/toolkit'
import { Web3ReactProvider } from '@web3-react/core'
import { providers } from 'ethers'
import React from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'

import { Main } from './components/main'
import { ApolloProviderWrapper } from './contexts/Apollo'
import { ConnectedCPK } from './hooks'
import balanceReducer from './store/reducer'
import theme from './theme'
import { GlobalStyle } from './theme/global_style'

const store = configureStore({ reducer: balanceReducer })

function getLibrary(provider: any) {
  return new providers.Web3Provider(provider)
}

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <ConnectedCPK>
          <ApolloProviderWrapper>
            <Provider store={store}>
              <GlobalStyle />
              <Main />
            </Provider>
          </ApolloProviderWrapper>
        </ConnectedCPK>
      </Web3ReactProvider>
    </ThemeProvider>
  )
}

export default App
