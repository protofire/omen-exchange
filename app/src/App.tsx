import { configureStore } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { Provider } from 'react-redux'
import Web3Provider from 'web3-react'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'
import { Main } from './components/main'
import { ContentWrapper, ModalTitle } from './components/modal/common_styled'
import { ConnectionModalNavigation, SettingsModalWrapper } from './components/modal/modal_your_connection'
import SettingsViewContainer from './components/settings/settings_view'
import { ConnectedWeb3 } from './contexts'
import { ApolloProviderWrapper } from './contexts/Apollo'
import balanceReducer from './store/reducer'
import { ThemeProvider, theme } from './theme'
import { GlobalStyle } from './theme/global_style'
import connectors from './util/connectors'
import { getInfuraUrl, networkIds } from './util/networks'
import { checkRpcStatus, getNetworkFromChain } from './util/tools'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = (props: any) => {
  const { ...restProps } = props
  const windowObj: any = window

  const ethereum = windowObj.ethereum

  const [status, setStatus] = useState(true)

  useEffect(() => {
    const handleRpcStatus = async () => {
      if (ethereum) {
        const chainId = await ethereum.request({ method: 'eth_chainId' })
        let network = getNetworkFromChain(chainId ? chainId.toString() : '-1')

        const initialRelayState =
          localStorage.getItem('relay') === 'false' || network !== networkIds.MAINNET ? false : true
        if (initialRelayState) network = networkIds.XDAI

        checkRpcStatus(getInfuraUrl(network), setStatus, network)
      }
    }
    handleRpcStatus()
  }, [ethereum])

  return (
    <ThemeProvider>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        {!status ? (
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
                  <span>Settings</span>
                </ModalTitle>
              </ConnectionModalNavigation>
              <SettingsModalWrapper>
                <SettingsViewContainer />
              </SettingsModalWrapper>
            </ContentWrapper>
          </Modal>
        ) : (
          <ConnectedWeb3 setStatus={setStatus}>
            <ApolloProviderWrapper>
              <Provider store={store}>
                <GlobalStyle />
                <Main />
              </Provider>
            </ApolloProviderWrapper>
          </ConnectedWeb3>
        )}
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
