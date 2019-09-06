import React from 'react'
import Web3Provider, { useWeb3Context, Web3Consumer } from 'web3-react'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import connectors from './connectors'

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
    } else {
      try {
        WalletConnectQRCodeModal.close()
      } catch (err) {
        console.error(err)
      }
    }
  }, [context, context.active])

  return (
    <>
      {Object.keys(connectors).map(connectorName => (
        <button
          key={connectorName}
          disabled={context.connectorName === connectorName}
          onClick={() => context.setConnector(connectorName)}
        >
          Connect with {connectorName}
        </button>
      ))}

      {(context.active || (context.error && context.connectorName)) && (
        <button onClick={() => context.unsetConnector()}>
          {context.active ? 'Deactivate Connector' : 'Reset'}
        </button>
      )}
    </>
  )
}

const ConnectionStatus: React.FC = () => {
  return (
    <Web3Consumer>
      {// eslint-disable-next-line
        (context: any) => {
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
    <Web3Provider connectors={connectors} libraryName="ethers.js">
      <ConnectWallet />
      <ConnectionStatus />
    </Web3Provider>
  )
}

export default App
