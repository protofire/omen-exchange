import { configureStore } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import Web3Provider from 'web3-react'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'
import { IconArrowBack, IconClose } from './components/common/icons/'
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
import { getInfuraUrl } from './util/networks'
import { checkRpcStatus, getNetworkFromChain } from './util/tools'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = () => {
  const windowObj: any = window

  const ethereum = windowObj.ethereum
  const networkId = ethereum && ethereum.chainId
  const [status, setStatus] = useState(true)
  const network = getNetworkFromChain(networkId)

  useEffect(() => {
    if (network && network !== -1) checkRpcStatus(getInfuraUrl(network), setStatus, network)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereum])

  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        {!status ? (
          <>
            <Modal isOpen={true}>
              <ContentWrapper>
                <ConnectionModalNavigation>
                  <ModalTitle>
                    <IconArrowBack hoverEffect={true} onClick={() => alert('Please set your network!')} />
                    <span style={{ marginLeft: '15px' }}>Settings</span>
                  </ModalTitle>

                  <IconClose
                    hoverEffect={true}
                    onClick={() => {
                      alert('Please set your network!')
                    }}
                  />
                </ConnectionModalNavigation>
                <SettingsModalWrapper>
                  <SettingsViewContainer networkId={networkId} />
                </SettingsModalWrapper>
              </ContentWrapper>
            </Modal>
          </>
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
