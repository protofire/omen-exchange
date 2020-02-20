import {
  INFURA_PROJECT_ID,
  EARLIEST_GANACHE_BLOCK_TO_CHECK,
  EARLIEST_RINKEBY_BLOCK_TO_CHECK,
  EARLIEST_MAINNET_BLOCK_TO_CHECK,
} from '../common/constants'
import { entries, isNotNull } from '../util/type-utils'

import { Token, Arbitrator } from './types'

export type NetworkId = 1 | 4 | 50

export const networkIds = {
  MAINNET: 1,
  RINKEBY: 4,
  GANACHE: 50,
} as const

type CPKAddresses = {
  masterCopyAddress: string
  proxyFactoryAddress: string
  multiSendAddress: string
  fallbackHandlerAddress: string
}

interface Network {
  label: string
  url: string
  realitioTimeout: number
  earliestBlockToCheck: number
  contracts: {
    realitio: string
    marketMakerFactory: string
    conditionalTokens: string
    oracle: string
    klerosBadge: string
    klerosTokenView: string
    klerosTCR: string
  }
  cpk?: CPKAddresses
}

type KnownContracts = keyof Network['contracts']

interface KnownTokenData {
  symbol: string
  decimals: number
  addresses: {
    [K in NetworkId]?: string
  }
  order: number
}

const networks: { [K in NetworkId]: Network } = {
  [networkIds.MAINNET]: {
    label: 'Mainnet',
    url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    realitioTimeout: 86400,
    earliestBlockToCheck: EARLIEST_MAINNET_BLOCK_TO_CHECK
      ? parseInt(EARLIEST_MAINNET_BLOCK_TO_CHECK, 10)
      : 9294139,
    contracts: {
      realitio: '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47',
      marketMakerFactory: '0xe7E502789B8f4cDC99e6Cf9d3963E8C76784da51',
      conditionalTokens: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
      oracle: '0x7B46FEcfBA4eB9D14970bc248dA15a3Fb4457A27',
      klerosBadge: '0xcb4aae35333193232421e86cd2e9b6c91f3b125f',
      klerosTokenView: '0xf9b9b5440340123b21bff1ddafe1ad6feb9d6e7f',
      klerosTCR: '0xebcf3bca271b26ae4b162ba560e243055af0e679',
    },
  },
  [networkIds.RINKEBY]: {
    label: 'Rinkeby',
    url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
    realitioTimeout: 10,
    earliestBlockToCheck: EARLIEST_RINKEBY_BLOCK_TO_CHECK
      ? parseInt(EARLIEST_RINKEBY_BLOCK_TO_CHECK, 10)
      : 5827230,
    contracts: {
      realitio: '0x3D00D77ee771405628a4bA4913175EcC095538da',
      marketMakerFactory: '0xe7E502789B8f4cDC99e6Cf9d3963E8C76784da51',
      conditionalTokens: '0xe6Cdc22F99FD9ffdC03647C7fFF5bB753a4eBB21',
      oracle: '0x5A90132C104CA33652Ee71E2E645D5A4d8E5d7D6',
      klerosBadge: '0x0',
      klerosTokenView: '0x0',
      klerosTCR: '0x0',
    },
  },
  [networkIds.GANACHE]: {
    label: 'Ganache',
    url: `http://localhost:8545`,
    realitioTimeout: 10,
    earliestBlockToCheck: EARLIEST_GANACHE_BLOCK_TO_CHECK
      ? parseInt(EARLIEST_GANACHE_BLOCK_TO_CHECK, 10)
      : 1,
    contracts: {
      realitio: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
      marketMakerFactory: '0x5017A545b09ab9a30499DE7F431DF0855bCb7275',
      conditionalTokens: '0xD86C8F0327494034F60e25074420BcCF560D5610',
      oracle: '0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A',
      klerosBadge: '0x0',
      klerosTokenView: '0x0',
      klerosTCR: '0x0',
    },
    cpk: {
      masterCopyAddress: '0x1b88Bdb8269A1aB1372459F5a4eC3663D6f5cCc4',
      proxyFactoryAddress: '0xaf5C4C6C7920B4883bC6252e9d9B8fE27187Cf68',
      multiSendAddress: '0xEC5d4F247aF81A843612eb1371CBCfa88b762119',
      fallbackHandlerAddress: '0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E',
    },
  },
}

export const supportedNetworkIds = Object.keys(networks).map(Number) as NetworkId[]

export const supportedNetworkURLs = entries(networks).reduce<{
  [networkId: number]: string
}>(
  (acc, [networkId, network]) => ({
    ...acc,
    [networkId]: network.url,
  }),
  {},
)

export const infuraNetworkURL =
  process.env.NODE_ENV === 'development' ? networks[4].url : networks[1].url

export const knownTokens: { [name in KnownToken]: KnownTokenData } = {
  cdai: {
    symbol: 'CDAI',
    decimals: 18,
    addresses: {
      [networkIds.MAINNET]: '0xa4c993e32876795abf80842adb0a241bb0eecd47',
      [networkIds.RINKEBY]: '0x7a978b38d5af06ff929ca06647e025b759479318',
      [networkIds.GANACHE]: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
    },
    order: 2,
  },
  dai: {
    symbol: 'DAI',
    decimals: 18,
    addresses: {
      [networkIds.MAINNET]: '0x6b175474e89094c44da98b954eedeac495271d0f',
      [networkIds.RINKEBY]: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      [networkIds.GANACHE]: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
    },
    order: 1,
  },
  weth: {
    symbol: 'WETH',
    decimals: 18,
    addresses: {
      [networkIds.MAINNET]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      [networkIds.RINKEBY]: '0xc778417e063141139fce010982780140aa0cd5ab',
      [networkIds.GANACHE]: '0x0290FB167208Af455bB137780163b7B7a9a10C16',
    },
    order: 3,
  },
  usdc: {
    symbol: 'USDC',
    decimals: 6,
    addresses: {
      [networkIds.MAINNET]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      [networkIds.RINKEBY]: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
      [networkIds.GANACHE]: '0xe982E462b094850F12AF94d21D470e21bE9D0E9C',
    },
    order: 4,
  },
  owl: {
    symbol: 'OWL',
    decimals: 18,
    addresses: {
      [networkIds.MAINNET]: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
      [networkIds.RINKEBY]: '0x9187a7788410f54a630407fa994c1555722f9abc',
      [networkIds.GANACHE]: '0x59d3631c86BbE35EF041872d502F218A39FBa150',
    },
    order: 5,
  },
  chai: {
    symbol: 'CHAI',
    decimals: 18,
    addresses: {
      [networkIds.MAINNET]: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
      [networkIds.GANACHE]: '0x9b1f7F645351AF3631a656421eD2e40f2802E6c0',
    },
    order: 6,
  },
}

const validNetworkId = (networkId: number): networkId is NetworkId => {
  return networks[networkId as NetworkId] !== undefined
}

export const getContractAddress = (networkId: number, contract: KnownContracts) => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }
  return networks[networkId].contracts[contract]
}

export const getToken = (networkId: number, tokenId: KnownToken): Token => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  const token = knownTokens[tokenId]
  if (!token) {
    throw new Error(`Unsupported token id: '${tokenId}'`)
  }

  const address = token.addresses[networkId]

  if (!address) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return {
    address,
    decimals: token.decimals,
    symbol: token.symbol,
  }
}

export const getTokenFromAddress = (networkId: number, address: string): Token => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  for (const token of Object.values(knownTokens)) {
    const tokenAddress = token.addresses[networkId]

    // token might not be supported in the current network
    if (!tokenAddress) {
      continue
    }

    if (tokenAddress.toLowerCase() === address.toLowerCase()) {
      return {
        address: tokenAddress,
        decimals: token.decimals,
        symbol: token.symbol,
      }
    }
  }

  throw new Error(`Couldn't find token with address '${address}' in network '${networkId}'`)
}

export const getContractAddressName = (networkId: number) => {
  const networkName = Object.keys(networkIds).find(key => (networkIds as any)[key] === networkId)
  const networkNameCase =
    networkName && networkName.substr(0, 1).toUpperCase() + networkName.substr(1).toLowerCase()
  return networkNameCase
}

export const getDefaultToken = (networkId: number) => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return getToken(networkId, 'dai')
}

export const getTokensByNetwork = (networkId: number): Token[] => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return Object.values(knownTokens)
    .sort((a, b) => (a.order > b.order ? 1 : -1))
    .map(token => {
      const address = token.addresses[networkId]
      if (address) {
        return {
          symbol: token.symbol,
          decimals: token.decimals,
          address,
        }
      }
      return null
    })
    .filter(isNotNull)
}

interface KnownArbitratorData {
  name: string
  url: string
  addresses: {
    [networkId: number]: string
  }
}

export const knownArbitrators: { [name in KnownArbitrator]: KnownArbitratorData } = {
  kleros: {
    name: 'Kleros',
    url: 'https://kleros.io/',
    addresses: {
      [networkIds.MAINNET]: '0xd47f72a2d1d0E91b0Ec5e5f5d02B2dc26d00A14D',
      [networkIds.RINKEBY]: '0xcafa054b1b054581faf65adce667bf1c684b6ef0',
      [networkIds.GANACHE]: '0x0000000000000000000000000000000000c1e305',
    },
  },
  realitio: {
    name: 'Realitio Team',
    url: 'https://realit.io/',
    addresses: {
      [networkIds.MAINNET]: '0xdc0a2185031ecf89f091a39c63c2857a7d5c301a',
      [networkIds.RINKEBY]: '0x02321745bE4a141E78db6C39834396f8df00e2a0',
      [networkIds.GANACHE]: '0x000000000000000000000000000000003ea11710',
    },
  },
  unknown: {
    name: 'Unknown',
    url: '',
    addresses: {},
  },
}

export const getArbitrator = (networkId: number, arbitratorId: KnownArbitrator): Arbitrator => {
  const arbitrator = knownArbitrators[arbitratorId]
  const address = arbitrator.addresses[networkId]

  if (!address) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return {
    id: arbitratorId,
    address,
    name: arbitrator.name,
    url: arbitrator.url,
  }
}

export const getDefaultArbitrator = (networkId: number) => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return getArbitrator(networkId, 'realitio')
}

export const getArbitratorFromAddress = (networkId: number, address: string): Maybe<Arbitrator> => {
  for (const key in knownArbitrators) {
    const arbitrator = knownArbitrators[key as KnownArbitrator]
    const arbitratorAddress = arbitrator.addresses[networkId]

    // arbitratorId might not be supported in the current network
    if (!arbitratorAddress) {
      continue
    }

    if (arbitratorAddress.toLowerCase() === address.toLowerCase()) {
      return {
        id: key as KnownArbitrator,
        address: arbitratorAddress,
        name: arbitrator.name,
        url: arbitrator.url,
      }
    }
  }

  return {
    id: 'unknown' as KnownArbitrator,
    address: address,
    name: 'Unknown',
    url: '',
  }
}

export const getKnowArbitratorFromAddress = (
  networkId: number,
  address: string,
): KnownArbitrator => {
  for (const key in knownArbitrators) {
    const arbitratorAddress = knownArbitrators[key as KnownArbitrator].addresses[networkId]

    if (!arbitratorAddress) {
      continue
    }

    if (arbitratorAddress.toLowerCase() === address.toLowerCase()) {
      return key as KnownArbitrator
    }
  }

  return 'unknown' as KnownArbitrator
}

export const getRealitioTimeout = (networkId: number): number => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return networks[networkId].realitioTimeout
}

export const getEarliestBlockToCheck = (networkId: number): number => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return networks[networkId].earliestBlockToCheck
}

export const getArbitratorsByNetwork = (networkId: number): Arbitrator[] => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return Object.values(knownArbitrators)
    .map(arbitrator => {
      const address = arbitrator.addresses[networkId]
      if (address) {
        const { name, url } = arbitrator
        const id = getKnowArbitratorFromAddress(networkId, address)
        return {
          id,
          name,
          url,
          address,
        }
      }
      return null
    })
    .filter(isNotNull)
}

export const getCPKAddresses = (networkId: number): Maybe<CPKAddresses> => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  const cpkAddresses = networks[networkId].cpk
  return cpkAddresses || null
}
