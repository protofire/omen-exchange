import React from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'

import { CONNECTOR } from '../../common/constants'

const Connect = styled.span`
  color: #104cfb;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #222;
  }
`

const ConnectWallet = (props: any) => {
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
        <div {...props}>
          <Connect onClick={() => context.setConnector(CONNECTOR)}>
            Connect with {CONNECTOR}
          </Connect>
        </div>
      )}
    </>
  )
}
export { ConnectWallet }
