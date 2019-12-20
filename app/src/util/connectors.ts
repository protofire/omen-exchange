import { Connectors } from 'web3-react'
import WalletConnectApi from '@walletconnect/web3-subprovider'

import { infuraNetworkURL, supportedNetworkIds, supportedNetworkURLs } from '../util/networks'

const { InjectedConnector, WalletConnectConnector, NetworkOnlyConnector } = Connectors

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
