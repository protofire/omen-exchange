import { Token, Arbitrator } from './types'

const networkIds = {
  MAINNET: 1,
  RINKEBY: 4,
  GANACHE: 50,
}

interface KnownContracts {
  realitio: string
  marketMakerFactory: string
  conditionalTokens: string
  oracle: string
}

interface KnownTokenData {
  symbol: string
  decimals: number
  addresses: {
    [networkId: number]: string
  }
}

const addresses: { [networkId: number]: KnownContracts } = {
  [networkIds.MAINNET]: {
    realitio: '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47',
    marketMakerFactory: '0x2E8C4eC3fE9E3FC78FAE42af9c93A4DC88c38cb7',
    conditionalTokens: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
    oracle: '0xf3582e5D53D330266E0923e736Aa5b907726272c',
  },
  [networkIds.RINKEBY]: {
    realitio: '0x3D00D77ee771405628a4bA4913175EcC095538da',
    marketMakerFactory: '0xD0B953db85fb6f0C6A437b18140Ba857cb67768a',
    conditionalTokens: '0xe6Cdc22F99FD9ffdC03647C7fFF5bB753a4eBB21',
    oracle: '0xa5C8Cea58D79dd3094281eac1048a937beF6C84C',
  },
  [networkIds.GANACHE]: {
    realitio: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
    marketMakerFactory: '0x21a59654176f2689d12E828B77a783072CD26680',
    conditionalTokens: '0xb09bCc172050fBd4562da8b229Cf3E45Dc3045A6',
    oracle: '0x7C728214be9A0049e6a86f2137ec61030D0AA964',
  },
}

export const knownTokens: { [name in KnownToken]: KnownTokenData } = {
  cdai: {
    symbol: 'CDAI',
    decimals: 8,
    addresses: {
      [networkIds.MAINNET]: '0xa4c993e32876795abf80842adb0a241bb0eecd47',
      [networkIds.RINKEBY]: '0x7a978b38d5af06ff929ca06647e025b759479318',
      [networkIds.GANACHE]: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
    },
  },
  dai: {
    symbol: 'DAI',
    decimals: 6,
    addresses: {
      [networkIds.MAINNET]: '0x6b175474e89094c44da98b954eedeac495271d0f',
      [networkIds.RINKEBY]: '0xb307901ac0a807402a99879a491836697fec5e62',
      [networkIds.GANACHE]: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
    },
  },
  weth: {
    symbol: 'WETH',
    decimals: 18,
    addresses: {
      [networkIds.MAINNET]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      [networkIds.RINKEBY]: '0xc778417e063141139fce010982780140aa0cd5ab',
      [networkIds.GANACHE]: '0x0290FB167208Af455bB137780163b7B7a9a10C16',
    },
  },
  usdc: {
    symbol: 'USDC',
    decimals: 6,
    addresses: {
      [networkIds.MAINNET]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      [networkIds.RINKEBY]: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
      [networkIds.GANACHE]: '0xe982E462b094850F12AF94d21D470e21bE9D0E9C',
    },
  },
  owl: {
    symbol: 'OWL',
    decimals: 18,
    addresses: {
      [networkIds.MAINNET]: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
      [networkIds.RINKEBY]: '0x9187a7788410f54a630407fa994c1555722f9abc',
      [networkIds.GANACHE]: '0x59d3631c86BbE35EF041872d502F218A39FBa150',
    },
  },
}

export const getContractAddress = (networkId: number, contract: keyof KnownContracts) => {
  if (!addresses[networkId]) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }
  return addresses[networkId][contract]
}

export const getToken = (networkId: number, tokenId: KnownToken): Token => {
  const token = knownTokens[tokenId]
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
    name: 'realit.io',
    url: 'https://realit.io/',
    addresses: {
      [networkIds.MAINNET]: '0xdc0a2185031ecf89f091a39c63c2857a7d5c301a',
      [networkIds.RINKEBY]: '0x02321745bE4a141E78db6C39834396f8df00e2a0',
      [networkIds.GANACHE]: '0x000000000000000000000000000000003ea11710',
    },
  },
}

export const getArbitrator = (networkId: number, arbitratorId: KnownArbitrator): Arbitrator => {
  const arbitrator = knownArbitrators[arbitratorId]
  const address = arbitrator.addresses[networkId]

  if (!address) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return {
    address,
    name: arbitrator.name,
    url: arbitrator.url,
  }
}

export const getArbitratorFromAddress = (networkId: number, address: string): Maybe<Arbitrator> => {
  for (const arbitrator of Object.values(knownArbitrators)) {
    const arbitratorAddress = arbitrator.addresses[networkId]

    // arbitratorId might not be supported in the current network
    if (!arbitratorAddress) {
      continue
    }

    if (arbitratorAddress.toLowerCase() === address.toLowerCase()) {
      return {
        address: arbitratorAddress,
        name: arbitrator.name,
        url: arbitrator.url,
      }
    }
  }

  return null
}
