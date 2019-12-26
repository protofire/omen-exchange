import React from 'react'
import Web3Provider from 'web3-react'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import 'react-datepicker/dist/react-datepicker.css'
import 'sanitize.css'
import theme from './theme'
import connectors from './util/connectors'
import { Main } from './components'
import { WalletConnectStylesOverride } from './common/wallet_connect_styles_override'
import { DatepickerStylesOverride } from './common/datepicker_styles_override'

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
  ${DatepickerStylesOverride}

`

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        <GlobalStyle />
        <Main />
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
