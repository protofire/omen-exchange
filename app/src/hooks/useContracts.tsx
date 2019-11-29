import { useMemo } from 'react'
import { ConnectedWeb3Context } from './connectedWeb3'
import { getContractAddress } from '../util/addresses'
import {
  ConditionalTokenService,
  MarketMakerFactoryService,
  OracleService,
  RealitioService,
} from '../services'

export interface Contracts {
  conditionalTokens: ConditionalTokenService
  marketMakerFactory: MarketMakerFactoryService
  realitio: RealitioService
  oracle: OracleService
}

export const useContracts = (context: ConnectedWeb3Context) => {
  const { library, networkId } = context
  const account = context.account

  const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
  const conditionalTokens = useMemo(
    () => new ConditionalTokenService(conditionalTokensAddress, library, account),
    [conditionalTokensAddress, library, account],
  )

  const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
  const marketMakerFactory = useMemo(
    () => new MarketMakerFactoryService(marketMakerFactoryAddress, library, account),
    [marketMakerFactoryAddress, library, account],
  )

  const realitioAddress = getContractAddress(networkId, 'realitio')
  const realitio = useMemo(() => new RealitioService(realitioAddress, library, account), [
    realitioAddress,
    library,
    account,
  ])

  const oracleAddress = getContractAddress(networkId, 'oracle')
  const oracle = useMemo(() => new OracleService(oracleAddress, library), [oracleAddress, library])

  return useMemo(
    () => ({
      conditionalTokens,
      marketMakerFactory,
      realitio,
      oracle,
    }),
    [conditionalTokens, marketMakerFactory, realitio, oracle],
  )
}
