import React from 'react'
import Web3Provider, { useWeb3Context, Web3Consumer } from 'web3-react'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import connectors from './connectors'

const connectorName: string = process.env.REACT_APP_CONNECTOR || 'MetaMask'
const connector = connectors[connectorName as keyof typeof connectors]

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
    <button
      disabled={context.connectorName === connectorName}
      onClick={() => context.setConnector(connectorName)}
    >
      Connect with {connectorName}
    </button>
  )
}

const ConnectionStatus: React.FC = () => {
  return (
    <Web3Consumer>
      {(context: any) => {
        const { active, account, networkId } = context
        return (
          active && (
            <React.Fragment>
              <p>Account: {account || 'None'}</p>
              <p>Network ID: {networkId || 'None'}</p>
            </React.Fragment>
          )
        )
      }}
    </Web3Consumer>
  )
}

const App: React.FC = () => {
  return (
    <Web3Provider connectors={{ [connectorName]: connector }} libraryName="ethers.js">
      <ConnectWallet />
      <ConnectionStatus />
    </Web3Provider>
  )
}

export default App
