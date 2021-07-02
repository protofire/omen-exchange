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
import { getInfuraUrl, networkIds } from './util/networks'
import { checkRpcStatus, getNetworkFromChain } from './util/tools'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = (props: any) => {
  const { ...restProps } = props
  const windowObj: any = window
  console.log(windowObj.ethereum.chainId)
  console.log(windowObj)
  const ethereum = windowObj.ethereum
  const [networkId, setNetworkId] = useState(ethereum.chainId)
  const [timer, setTimer] = useState<number>(1)
  //networkId = ethereum.chainId

  const [status, setStatus] = useState(true)
  // const [settingsView, setSettingsView] = useState(false)

  useInterval(() => {
    const ethereum = (window as any).ethereum.chainId
    console.log('inside set Interval app root file chainId', ethereum)

    const initialRelayState =
      localStorage.getItem('relay') === 'false' || ethereum !== networkIds.MAINNET ? false : true
    console.log('initialRElay state in interval', initialRelayState)
    console.log('network set', initialRelayState ? networkIds.XDAI : ethereum ? getNetworkFromChain(ethereum) : '-1')
    setNetworkId(initialRelayState ? networkIds.XDAI : ethereum ? getNetworkFromChain(ethereum) : '-1')
    setTimer(timer + 1)
    // if (ethereum === null) {
    //   setStatus(false)
    // }

    // checkRpcStatus(
    //   getInfuraUrl(initialRelayState ? networkIds.XDAI : networkFormat),
    //   setStatus,
    //   initialRelayState ? networkIds.XDAI : networkFormat,
    //)
  }, FETCH_RPC_INTERVAL)
  useEffect(() => {
    console.log('Status inside app.tsx', status)
  }, [status])
  useEffect(() => {
    console.log('Networkd id inside app inside app.tsx', networkId)
  }, [networkId])
  useEffect(() => {
    console.log(networkId, 'Netwrokd id used for the main stuff')
    let get = getNetworkFromChain(networkId ? networkId.toString() : '-1')
    console.log(get, 'Network inside the app.tsx')

    if (get && get !== -1) {
      const initialRelayState = localStorage.getItem('relay') === 'false' || get !== networkIds.MAINNET ? false : true

      if (initialRelayState) {
        console.log('network set to initail relay')
        get = networkIds.XDAI
      }

      checkRpcStatus(getInfuraUrl(get), setStatus, get)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, timer])

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
