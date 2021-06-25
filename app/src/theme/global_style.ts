import { createGlobalStyle } from 'styled-components'

import { DatepickerStylesOverride } from './overrides/datepicker_styles_override'
import { ReactTooltipStylesOverride } from './overrides/react_tooltip_styles_override'
import { ThreeboxStylesOverride } from './overrides/threebox_styles_override'

export const GlobalStyle = createGlobalStyle`
  html body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${({ theme }) => theme.white};
    font-family: ${({ theme }) => theme.fonts.fontFamily};
    font-size: ${({ theme }) => theme.fonts.defaultSize};
  }

  code {
    font-family: ${({ theme }) => theme.fonts.fontFamilyCode};
  }

  body,
  html,
  #root {
    height: 100vh;
  }

  ${DatepickerStylesOverride}
  ${ReactTooltipStylesOverride}
  ${ThreeboxStylesOverride}
`
