import { Connectors } from 'web3-react'
import WalletConnectApi from '@walletconnect/web3-subprovider'

const { InjectedConnector, WalletConnectConnector } = Connectors

const MetaMask = new InjectedConnector({
  supportedNetworks: [1, 4, 50],
})

const WalletConnect = new WalletConnectConnector({
  api: WalletConnectApi,
  bridge: 'https://bridge.walletconnect.org',
  supportedNetworkURLs: {
    1: 'https://mainnet.infura.io',
    4: 'https://rinkeby.infura.io',
    50: 'http://localhost:8545',
  },
  defaultNetwork: 4,
})

export default {
  MetaMask,
  WalletConnect,
}
