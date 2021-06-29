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
import { ConnectedWeb3 } from './hooks'
import balanceReducer from './store/reducer'
import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import connectors from './util/connectors'
import { getInfuraUrl } from './util/networks'
import { checkRpcStatus, getNetworkFromChain } from './util/tools'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = (props: any) => {
  const { ...restProps } = props
  const windowObj: any = window

  const ethereum = windowObj.ethereum

  const networkId = ethereum && ethereum.chainId
  const [status, setStatus] = useState(true)
  // const [settingsView, setSettingsView] = useState(false)
  console.log(status)
  // useInterval(() => {
  //   network = ethereum.networkVersion >> 0
  //   console.log('here')
  //
  //   if (status == false) {
  //     setTimeout(() => {
  //       if (status == false) setSettingsView(true)
  //     }, 2000)
  //   }
  // }, FETCH_RPC_INTERVAL)

  useEffect(() => {
    const get = getNetworkFromChain(networkId)

    if (get && get !== -1) checkRpcStatus(getInfuraUrl(get), setStatus, get)
    else setStatus(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereum, networkId])

  return (
    <ThemeProvider theme={theme}>
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
