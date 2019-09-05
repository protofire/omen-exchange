import { Connectors } from 'web3-react'
import WalletConnectApi from '@walletconnect/web3-subprovider'

export const WalletConnect = new Connectors.WalletConnectConnector({
  api: WalletConnectApi,
  bridge: 'https://bridge.walletconnect.org',
  supportedNetworkURLs: {
    1: 'https://mainnet.infura.io',
    4: 'https://rinkeby.infura.io',
  },
  defaultNetwork: 4,
})
