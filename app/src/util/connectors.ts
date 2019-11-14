import { Connectors } from 'web3-react'
import WalletConnectApi from '@walletconnect/web3-subprovider'
import { INFURA_PROJECT_ID } from '../common/constants'

const { InjectedConnector, WalletConnectConnector } = Connectors

const MetaMask = new InjectedConnector({
  supportedNetworks: [1, 4, 50],
})

const WalletConnect = new WalletConnectConnector({
  api: WalletConnectApi,
  bridge: 'https://bridge.walletconnect.org',
  supportedNetworkURLs: {
    1: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    4: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
    50: `http://localhost:8545`,
  },
  defaultNetwork: 4,
})

export default {
  MetaMask,
  WalletConnect,
}
