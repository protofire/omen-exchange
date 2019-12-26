import { css } from 'styled-components'

export const WalletConnectStylesOverride = css`
  #walletconnect-wrapper {
    height: 100vh !important;
    left: 0 !important;
    position: fixed !important;
    top: 0 !important;
    width: 100vw !important;
    z-index: 12345 !important;

    #walletconnect-qrcode-modal {
      background-color: transparent !important;
      position: relative !important;
      z-index: 1 !important;

      > div:first-child {
        background-color: ${props => props.theme.cards.backgroundColor} !important;
        border-radius: ${props => props.theme.cards.borderRadius} !important;
        border: ${props => props.theme.cards.border} !important;
        box-shadow: ${props => props.theme.cards.boxShadow} !important;
      }
    }

    #walletconnect-qrcode-close {
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMCIgdmlld0JveD0iMCAwIDEyIDEwIj4KICAgICAgPHBhdGgKICAgICAgICBkPSJNLTEuNzk0LTEuNTE2aC0zLjI4NEwtLjczLTYuNjExbC00LjEzOC00LjkwNWgzLjM3NmwyLjQxNCAzLjI1IDIuNDc4LTMuMjVoMy4yNjVMMi41MjctNi42OTJsNC4zOTUgNS4xNzZIMy40OTFMLjkyMi00LjkyMXoiCiAgICAgICAgZmlsbD0iIzk5OSIKICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1LjA3OCAxMS41MTYpIgogICAgICAvPgogICAgPC9zdmc+');
      background-position: 50% 50%;
      background-repeat: no-repeat;
      cursor: pointer;
      right: -10px !important;
      top: -10px !important;
      transform: none !important;

      > div {
        display: none;
      }
    }
  }
`
