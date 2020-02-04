import { useMemo } from 'react'
import { ConnectedWeb3Context } from './connectedWeb3'
import { getContractAddress } from '../util/networks'
import {
  ConditionalTokenService,
  MarketMakerService,
  MarketMakerFactoryService,
  OracleService,
  RealitioService,
} from '../services'
import { KlerosInteractionService } from '../services/kleros_interaction'

export const useContracts = (context: ConnectedWeb3Context) => {
  const { library: provider, networkId, account } = context

  const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
  const conditionalTokens = useMemo(
    () => new ConditionalTokenService(conditionalTokensAddress, provider, account),
    [conditionalTokensAddress, provider, account],
  )

  const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
  const marketMakerFactory = useMemo(
    () => new MarketMakerFactoryService(marketMakerFactoryAddress, provider, account),
    [marketMakerFactoryAddress, provider, account],
  )

  const realitioAddress = getContractAddress(networkId, 'realitio')
  const realitio = useMemo(() => new RealitioService(realitioAddress, provider, account), [
    realitioAddress,
    provider,
    account,
  ])

  const oracleAddress = getContractAddress(networkId, 'oracle')
  const oracle = useMemo(() => new OracleService(oracleAddress, provider, account), [
    oracleAddress,
    provider,
    account,
  ])

  const klerosInteractionAddress = getContractAddress(networkId, 'klerosInteraction')
  const klerosInteraction = useMemo(
    () => new KlerosInteractionService(provider, account, klerosInteractionAddress),
    [klerosInteractionAddress, provider, account],
  )

  const buildMarketMaker = useMemo(
    () => (address: string) =>
      new MarketMakerService(address, conditionalTokens, realitio, provider, account),
    [conditionalTokens, realitio, provider, account],
  )

  return useMemo(
    () => ({
      conditionalTokens,
      marketMakerFactory,
      realitio,
      oracle,
      buildMarketMaker,
      klerosInteraction,
    }),
    [conditionalTokens, marketMakerFactory, realitio, oracle, klerosInteraction, buildMarketMaker],
  )
}

export type Contracts = ReturnType<typeof useContracts>
