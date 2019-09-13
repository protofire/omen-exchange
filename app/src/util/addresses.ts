const networkIds = {
  RINKEBY: 4,
  GANACHE: 50,
}

interface KnownContracts {
  realitio: string
  realitioArbitrator: string
  dai: string
  marketMakerFactory: string
}

const addresses: { [networkId: number]: KnownContracts } = {
  [networkIds.RINKEBY]: {
    realitio: '0x3D00D77ee771405628a4bA4913175EcC095538da',
    realitioArbitrator: '0x02321745bE4a141E78db6C39834396f8df00e2a0',
    dai: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    marketMakerFactory: '0xBeBE9776252396cB1Da2c86Fa850A8D851A9E962',
  },
  [networkIds.GANACHE]: {
    realitio: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
    realitioArbitrator: '0x254dffcd3277c0b1660f6d42efbb754edababc2b',
    dai: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
    marketMakerFactory: '0xFC628dd79137395F3C9744e33b1c5DE554D94882',
  },
}

export const getContractAddress = (networkId: number, contract: keyof KnownContracts) => {
  if (!addresses[networkId]) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }
  return addresses[networkId][contract]
}
