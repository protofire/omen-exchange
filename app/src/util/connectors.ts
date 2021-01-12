import WalletConnectApi from '@walletconnect/web3-subprovider'
import AuthereumApi from 'authereum'
import { ethers } from 'ethers'
import { Connectors } from 'web3-react'

import { getInfuraUrl, infuraNetworkURL, supportedNetworkIds, supportedNetworkURLs } from '../util/networks'

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

class SafeConnector extends Connectors.Connector {
  init(address: string, networkId: number) {
    this.address = address
    this.networkId = networkId
  }

  public async getProvider(): Promise<any> {
    const provider = new ethers.providers.JsonRpcProvider(getInfuraUrl(this.networkId), this.networkId)
    const getSigner = provider.getSigner.bind(provider)
    provider.getSigner = () => getSigner(this.address)
    return provider
  }

  public async getNetworkId(): Promise<number> {
    return this._validateNetworkId(this.networkId)
  }

  public async getAccount(): Promise<string> {
    return this.address
  }
}

const Safe = new SafeConnector()

export default {
  Infura,
  MetaMask,
  WalletConnect,
  Authereum,
  Safe,
}
