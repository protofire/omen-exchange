import WalletConnectApi from '@walletconnect/web3-subprovider'
import AuthereumApi from 'authereum'
import { Connectors } from 'web3-react'

import { infuraNetworkURL, supportedNetworkIds, supportedNetworkURLs } from '../util/networks'

const { InjectedConnector, NetworkOnlyConnector, WalletConnectConnector } = Connectors

const MetaMask = new InjectedConnector({
  supportedNetworks: supportedNetworkIds,
})

const WalletConnect = new WalletConnectConnector({
  api: WalletConnectApi,
  bridge: 'https://safe-walletconnect.gnosis.io',
  supportedNetworkURLs,
  defaultNetwork: 1,
})

const Infura = new NetworkOnlyConnector({
  providerURL: infuraNetworkURL,
})

class AuthereumConnector extends Connectors.Connector {
  authereum: any

  onActivation(): Promise<void> {
    this.authereum = new AuthereumApi()
    return this.authereum.login()
  }

  getProvider() {
    return this.authereum.getProvider()
  }

  changeNetwork(network: string) {
    this.authereum = new AuthereumApi({
      networkId: network,
    })
  }
}

const Authereum = new AuthereumConnector()

export default {
  Infura,
  MetaMask,
  WalletConnect,
  Authereum,
}
