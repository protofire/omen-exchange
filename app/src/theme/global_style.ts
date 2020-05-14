import { createGlobalStyle } from 'styled-components'

import { DatepickerStylesOverride } from './overrides/datepicker_styles_override'
import { ReactTooltipStylesOverride } from './overrides/react_tooltip_styles_override'
import { ThreeboxStylesOverride } from './overrides/threebox_styles_override'
import { WalletConnectStylesOverride } from './overrides/wallet_connect_styles_override'

import theme from './'

type ThemeType = typeof theme

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  html body {
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
  ${ReactTooltipStylesOverride}
  ${ThreeboxStylesOverride}
`
