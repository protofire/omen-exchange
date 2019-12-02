import { useMemo } from 'react'
import { ConnectedWeb3Context } from './connectedWeb3'
import { getContractAddress } from '../util/addresses'
import {
  ConditionalTokenService,
  MarketMakerService,
  MarketMakerFactoryService,
  OracleService,
  RealitioService,
} from '../services'

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

  const buildMarketMaker = useMemo(
    () => (address: string) =>
      new MarketMakerService(address, conditionalTokens, realitio, library, account),
    [conditionalTokens, realitio, library, account],
  )

  return useMemo(
    () => ({
      conditionalTokens,
      marketMakerFactory,
      realitio,
      oracle,
      buildMarketMaker,
    }),
    [conditionalTokens, marketMakerFactory, realitio, oracle, buildMarketMaker],
  )
}

export type Contracts = ReturnType<typeof useContracts>
