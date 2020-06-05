import { css } from 'styled-components'

import { ButtonCSS } from '../../components/button/button_styling_types'

export const ThreeboxStylesOverride = css`
  .threeBoxCustom > .threebox-comments-react {
    max-width: 100%;
    min-width: 100%;
    overflow: hidden;
    padding: 0;

    .input {
      margin-left: 8px;
      margin-right: 8px;
    }

    .dialogue_button_container {
      height: auto;

      .dialogue_button {
        ${ButtonCSS}
        width: 100%;
      }
    }
  }

  footer {
    max-width: 100%;
    .footer_text {
      display: block;
      text-align: center;
    }

    * {
      max-width: 100%;
    }
  }
`
