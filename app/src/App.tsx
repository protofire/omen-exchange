import React from 'react'
import Web3Provider from 'web3-react'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { WalletConnect } from './connectors'
import { useWeb3Context } from 'web3-react'

const ConnectWallet: React.FC = () => {
  const context = useWeb3Context()

  const connect = () => {
    context.setConnector('WalletConnect', { networkId: 4 })
  }

  React.useEffect(() => {
    if (context.active && !context.account) {
      const uri = context.connector.walletConnector.uri
      WalletConnectQRCodeModal.open(uri, () => {})

      context.connector.walletConnector.on('connect', () => {
        WalletConnectQRCodeModal.close()
      })
    }
  }, [context, context.active])

  return <button onClick={connect}>Connect</button>
}

const Account: React.FC = () => {
  const context = useWeb3Context()

  return <div>{context.account || 'not connected'}</div>
}

const CurrentNetwork: React.FC = () => {
  const context = useWeb3Context()

  return <div>{context.networkId}</div>
}

const App: React.FC = () => {
  return (
    <Web3Provider connectors={{ WalletConnect }} libraryName="ethers.js">
      <ConnectWallet />
      <Account />
      <CurrentNetwork />
    </Web3Provider>
  )
}

export default App
