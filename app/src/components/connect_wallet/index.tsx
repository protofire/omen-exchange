import React from 'react'
import { useWeb3Context } from 'web3-react'
import styled from 'styled-components'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { CONNECTOR } from '../../common/constants'

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

const Dot = styled.div`
  background-color: #ccc;
  border-radius: 50%;
  height: 12px;
  margin-right: 8px;
  width: 12px;
`

export const ConnectWallet = (props: any) => {
  const context = useWeb3Context()

  if (context.error) {
    console.error('Error in web3 context', context.error)
  }

  React.useEffect(() => {
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
        <Wrapper {...props} onClick={() => context.setConnector(CONNECTOR)}>
          <Dot />
          <Text>Click to connect with {CONNECTOR}</Text>
        </Wrapper>
      )}
    </>
  )
}
