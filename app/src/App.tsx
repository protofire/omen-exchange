import { useInterval } from '@react-corekit/use-interval'
import { configureStore } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import Web3Provider from 'web3-react'

import { FETCH_RPC_INTERVAL } from '../src/common/constants'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'
import { Main } from './components/main'
import { ContentWrapper, ModalTitle } from './components/modal/common_styled' // here
import { ConnectionModalNavigation, SettingsModalWrapper } from './components/modal/modal_your_connection'
import SettingsViewContainer from './components/settings/settings_view'
import { ApolloProviderWrapper } from './contexts/Apollo'
import { ConnectedBalance, ConnectedWeb3 } from './hooks'
import balanceReducer from './store/reducer'
import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import connectors from './util/connectors'
import { getInfuraUrl, networkIds, networks } from './util/networks'
import { checkRpcStatus, getNetworkFromChain } from './util/tools'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = (props: any) => {
  const { ...restProps } = props
  const windowObj: any = window

  const ethereum = windowObj.ethereum
  const networkId = ethereum && ethereum.chainId
  const [status, setStatus] = useState(true)
  const network = getNetworkFromChain(networkId)
  const [settingsView, setSettingsView] = useState(false)

  useInterval(() => {
    console.log(status)

    if (status == false) {
      setTimeout(() => {
        if (status == false) setSettingsView(true)
      }, 2000)
    }
    if (status == false && getNetworkFromChain(ethereum.chainId) == 100) {
      localStorage.setItem(
        'rpcAddress',
        JSON.stringify({
          url: networks[networkIds.XDAI].url,
          network: networkIds.XDAI,
          index: 0,
        }),
      )
      windowObj.location.reload(true)
    }
  }, FETCH_RPC_INTERVAL)

  useEffect(() => {
    if (network && network !== -1) checkRpcStatus(getInfuraUrl(network), setStatus, network)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereum])

  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        {settingsView ? (
          <Modal
            isOpen={true}
            style={{
              ...theme.fluidHeightModal,
              content: { ...theme.fluidHeightModal.content, height: '510px' },
            }}
            {...restProps}
          >
            <ContentWrapper>
              <ConnectionModalNavigation>
                <ModalTitle>
                  <span style={{ marginLeft: '15px' }}>Settings</span>
                </ModalTitle>
              </ConnectionModalNavigation>
              <SettingsModalWrapper>
                <SettingsViewContainer networkId={networkId} />
              </SettingsModalWrapper>
            </ContentWrapper>
          </Modal>
        ) : (
          <ConnectedWeb3 setStatus={setStatus}>
            <ApolloProviderWrapper>
              <Provider store={store}>
                <GlobalStyle />
                <ConnectedBalance>
                  <Main />
                </ConnectedBalance>
              </Provider>
            </ApolloProviderWrapper>
          </ConnectedWeb3>
        )}
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
