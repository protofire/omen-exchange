import WalletConnectApi from '@walletconnect/web3-subprovider'
import { Connectors } from 'web3-react'

import { infuraNetworkURL, supportedNetworkIds, supportedNetworkURLs } from '../util/networks'

const { InjectedConnector, NetworkOnlyConnector, WalletConnectConnector } = Connectors

const MetaMask = new InjectedConnector({
  supportedNetworks: supportedNetworkIds,
})

const WalletConnect = new WalletConnectConnector({
  api: WalletConnectApi,
  bridge: 'https://bridge.walletconnect.org',
  supportedNetworkURLs,
  defaultNetwork: 4,
})

const Infura = new NetworkOnlyConnector({
  providerURL: infuraNetworkURL,
})

export default {
  Infura,
  MetaMask,
  WalletConnect,
}
