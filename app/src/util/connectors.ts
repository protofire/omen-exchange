import WalletConnectProvider from '@walletconnect/web3-provider'
import AuthereumApi from 'authereum'
import { ethers } from 'ethers'
import { Connectors } from 'web3-react'

import { INFURA_PROJECT_ID } from '../common/constants'
import { getInfuraUrl, infuraNetworkURL, networkIds, supportedNetworkIds } from '../util/networks'

const { InjectedConnector, NetworkOnlyConnector } = Connectors

const MetaMask = new InjectedConnector({
  supportedNetworks: supportedNetworkIds,
})

class WalletConnectConnector extends Connectors.Connector {
  provider: any
  connect: any

  onActivation(): Promise<void> {
    // eslint-disable-next-line
    return new Promise(async resolve => {
      this.connect = new WalletConnectProvider({
        bridge: 'https://safe-walletconnect.gnosis.io',
        infuraId: INFURA_PROJECT_ID,
        rpc: {
          [networkIds.XDAI]: getInfuraUrl(networkIds.XDAI),
        },
      })

      this.provider = new ethers.providers.Web3Provider(this.connect)
      this.connect.on('accountsChanged', (accounts: string[]) => {
        this.account = accounts[0]
        this._web3ReactUpdateHandler({
          updateAccount: true,
          account: this.account,
        })
      })

      this.connect.on('chainChanged', (chainId: number) => {
        this.networkId = chainId
        this._web3ReactUpdateHandler({
          updateNetworkId: true,
          networkId: this.networkId,
        })
      })

      if (!this.activating) {
        this.activating = true
        try {
          const accounts = await this.connect.enable()
          const networkId = await this.connect.send('eth_chainId')
          this.account = accounts[0]
          this.networkId = networkId
          this._web3ReactUpdateHandler({
            updateAccount: true,
            account: this.account,
            updateNetworkId: true,
            networkId: this.networkId,
          })
          resolve()
        } catch (e) {
          localStorage.setItem('CONNECTOR', '')
          this.activating = false
          if (this.onError) {
            this.onError(e.message)
          }
        }
      }
    })
  }

  onDeactivation = () => {
    this.activating = false
    this.connect.disconnect()
  }

  getProvider = () => this.provider

  getAccount = () => {
    return this.account || null
  }

  public async getNetworkId(): Promise<number> {
    return this._validateNetworkId(this.networkId || null)
  }
}

const WalletConnect = new WalletConnectConnector()

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
