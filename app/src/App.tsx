import { configureStore } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import Web3Provider from 'web3-react'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'

import { MAIN_NETWORKS, RINKEBY_NETWORKS, SOKOL_NETWORKS, XDAI_NETWORKS } from './common/constants'
import { Footer } from './components/common/layout/footer'
import { Header } from './components/common/layout/header'
import { Main } from './components/main'
import { SettingsViewContainer } from './components/settings/settings_view'
import { ApolloProviderWrapper } from './contexts/Apollo'
import { ConnectedCPK, ConnectedWeb3 } from './hooks'
import balanceReducer from './store/reducer'
import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import connectors from './util/connectors'
import { getInfuraUrl, networkIds } from './util/networks'
import { checkRpcStatus } from './util/tools'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = () => {
  const windowObj: any = window
  console.log(windowObj.ethereum.chainId)
  const networkId = windowObj.ethereum.chainId
  console.log(networkId)
  const [status, setStatus] = useState(true)
  const network = RINKEBY_NETWORKS.includes(networkId)
    ? networkIds.RINKEBY
    : SOKOL_NETWORKS.includes(networkId)
    ? networkIds.SOKOL
    : MAIN_NETWORKS.includes(networkId)
    ? networkIds.MAINNET
    : XDAI_NETWORKS.includes(networkId)
    ? networkIds.XDAI
    : null
  useEffect(() => {
    if (network) checkRpcStatus(getInfuraUrl(network), setStatus)
  }, [])
  console.log(status)
  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        {!status ? (
          <>
            <SettingsViewContainer networkId={networkId} />
          </>
        ) : (
          <ConnectedWeb3>
            <ConnectedCPK>
              <ApolloProviderWrapper>
                <Provider store={store}>
                  <GlobalStyle />
                  <Main />
                </Provider>
              </ApolloProviderWrapper>
            </ConnectedCPK>
          </ConnectedWeb3>
        )}
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
