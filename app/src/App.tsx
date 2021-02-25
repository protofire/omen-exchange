import { configureStore } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import Web3Provider from 'web3-react'

import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'

import { MAINNET_LOCATION, XDAI_LOCATION } from './common/constants'
import { IconSettings } from './components/common/icons'
import {
  ButtonSettings,
  ContentsLeft,
  ContentsRight,
  HeaderInner,
  HeaderWrapper,
  LogoWrapper,
} from './components/common/layout/header'
import { OmenLogo } from './components/common/logos/omen'
import { Main } from './components/main'
import SettingsViewContainer from './components/settings/settings_view'
import { ApolloProviderWrapper } from './contexts/Apollo'
import { ConnectedCPK, ConnectedWeb3 } from './hooks'
import balanceReducer from './store/reducer'
import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import connectors from './util/connectors'
import { getInfuraUrl, networkIds } from './util/networks'
import { checkRpcStatus, getNetworkFromChain } from './util/tools'

const store = configureStore({ reducer: balanceReducer })

const App: React.FC = () => {
  const windowObj: any = window

  const ethereum = windowObj.ethereum
  const networkId = ethereum.chainId
  const [status, setStatus] = useState(true)
  const network = getNetworkFromChain(networkId)

  useEffect(() => {
    if (location.host === MAINNET_LOCATION) network === networkIds.MAINNET
    if (location.host === XDAI_LOCATION) network === networkIds.XDAI

    if (network && network !== -1) checkRpcStatus(getInfuraUrl(network), setStatus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereum])

  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        {!status ? (
          <>
            <HeaderWrapper>
              <HeaderInner>
                <ContentsLeft>
                  <LogoWrapper as="div">
                    <OmenLogo />
                  </LogoWrapper>
                </ContentsLeft>
                <ContentsRight>
                  <ButtonSettings>
                    <IconSettings />
                  </ButtonSettings>
                </ContentsRight>
              </HeaderInner>
            </HeaderWrapper>
            <SettingsViewContainer networkId={networkId} />
          </>
        ) : (
          <ConnectedWeb3 setStatus={setStatus}>
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
