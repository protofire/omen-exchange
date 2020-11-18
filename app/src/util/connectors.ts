import { AuthereumConnector } from '@web3-react/authereum-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import { supportedNetworkIds, supportedNetworkURLs } from '../util/networks'

const MetaMask = new InjectedConnector({
  supportedChainIds: supportedNetworkIds,
})

const WalletConnect = new WalletConnectConnector({
  rpc: { [1]: supportedNetworkURLs[1] },
  bridge: 'https://safe-walletconnect.gnosis.io',
  qrcode: true,
})

const Infura = new NetworkConnector({
  urls: supportedNetworkURLs,
  defaultChainId: 1,
})

const Authereum = new AuthereumConnector({
  chainId: 1,
})

export default {
  Infura,
  MetaMask,
  WalletConnect,
  Authereum,
} as Record<string, any>
