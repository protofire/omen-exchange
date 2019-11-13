import React, { useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import styled, { css } from 'styled-components'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'

const Wrapper = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
`

const Text = styled.span`
  color: #999;
  font-size: 14px;
  font-weight: 400;

  &:hover {
    color: #000;
  }
`

const Separator = css`
  &::before {
    background-color: ${props => props.theme.header.color};
    content: '';
    height: 22px;
    margin: 0 15px;
    width: 1px;
  }
`

const ConnectorSeparator = styled.div`
  align-items: center;
  display: flex;
  ${Separator}
`

export const ConnectWallet = (props: any) => {
  const context = useWeb3Context()

  if (context.error) {
    console.error('Error in web3 context', context.error)
  }

  useEffect(() => {
    if (context.active && !context.account && context.connectorName === 'WalletConnect') {
      const uri = context.connector.walletConnector.uri
      WalletConnectQRCodeModal.open(uri, () => {})

      context.connector.walletConnector.on('connect', () => {
        WalletConnectQRCodeModal.close()
      })
    }
  }, [context, context.active])

  return (
    <>
      {!context.active && (
        <Wrapper {...props}>
          <Text
            onClick={() => {
              context.setConnector('MetaMask')
              localStorage.setItem('CONNECTOR', 'MetaMask')
            }}
          >
            Click to connect with Metamask
          </Text>
          <ConnectorSeparator>
            <Text
              onClick={() => {
                context.setConnector('WalletConnect')
                localStorage.setItem('CONNECTOR', 'WalletConnect')
              }}
            >
              Click to connect with WalletConnect
            </Text>
          </ConnectorSeparator>
        </Wrapper>
      )}
    </>
  )
}
