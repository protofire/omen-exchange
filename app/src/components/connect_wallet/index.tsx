import React from 'react'
import { useWeb3Context } from 'web3-react'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'

import { CONNECTOR } from '../../common/constants'
import { Button } from '../common'

const ConnectWallet: React.FC = () => {
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
    <Button
      disabled={context.connectorName === CONNECTOR}
      onClick={() => context.setConnector(CONNECTOR)}
    >
      Connect with {CONNECTOR}
    </Button>
  )
}
export { ConnectWallet }
