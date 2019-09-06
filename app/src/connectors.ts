import { Connectors } from 'web3-react'
import WalletConnectApi from '@walletconnect/web3-subprovider'
import { ConnectorsEnum } from './types'

const { InjectedConnector, WalletConnectConnector } = Connectors

const MetaMask = new InjectedConnector({
  supportedNetworks: [1, 4],
})

const WalletConnect = new WalletConnectConnector({
  api: WalletConnectApi,
  bridge: 'https://bridge.walletconnect.org',
  supportedNetworkURLs: {
    1: 'https://mainnet.infura.io',
    4: 'https://rinkeby.infura.io',
  },
  defaultNetwork: 4,
})

const connector = (process.env.REACT_APP_CONNECTOR || 'MetaMask') as ConnectorsEnum

const connectorToExport = connector === ConnectorsEnum.MetaMask ? { MetaMask } : { WalletConnect }

export default connectorToExport
