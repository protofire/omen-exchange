const networkIds = {
  MAINNET: 1,
  RINKEBY: 4,
  GANACHE: 50,
}

interface KnownContracts {
  realitio: string
  realitioArbitrator: string
  dai: string
  marketMakerFactory: string
  conditionalTokens: string
}

const addresses: { [networkId: number]: KnownContracts } = {
  [networkIds.MAINNET]: {
    realitio: '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47',
    realitioArbitrator: '0xdc0a2185031ecf89f091a39c63c2857a7d5c301a',
    dai: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    marketMakerFactory: '0x37186b5d78EbB1f37bC56e5dCa7f18aB98256C4B',
    conditionalTokens: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
  },
  [networkIds.RINKEBY]: {
    realitio: '0x3D00D77ee771405628a4bA4913175EcC095538da',
    // realitioArbitrator: '0x02321745bE4a141E78db6C39834396f8df00e2a0',
    // using a custom address as arbitrator for testing
    realitioArbitrator: '0xAEC3C8eD9516A206a4fD47EC77f026EDD533CF17',
    dai: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    marketMakerFactory: '0x965D4816a21CB3d482eD51F13369efa82Da5a9e2',
    conditionalTokens: '0xe6Cdc22F99FD9ffdC03647C7fFF5bB753a4eBB21',
  },
  [networkIds.GANACHE]: {
    realitio: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
    realitioArbitrator: '0x254dffcd3277c0b1660f6d42efbb754edababc2b',
    dai: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
    marketMakerFactory: '0x5f8e26fAcC23FA4cbd87b8d9Dbbd33D5047abDE1',
    conditionalTokens: '0x59d3631c86BbE35EF041872d502F218A39FBa150',
  },
}

export const getContractAddress = (networkId: number, contract: keyof KnownContracts) => {
  if (!addresses[networkId]) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }
  return addresses[networkId][contract]
}

export const getContractAddressName = (networkId: number) => {
  const networkName = Object.keys(networkIds).find(key => (networkIds as any)[key] === networkId)
  const networkNameCase =
    networkName && networkName.substr(0, 1).toUpperCase() + networkName.substr(1).toLowerCase()
  return networkNameCase
}
