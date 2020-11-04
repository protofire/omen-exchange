import { useMemo } from 'react'

import {
  ConditionalTokenService,
  DxTCRService,
  KlerosService,
  MarketMakerFactoryService,
  MarketMakerService,
  OracleService,
  RealitioService,
} from '../services'
import { getContractAddress } from '../util/networks'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useContracts = (context: ConnectedWeb3Context) => {
  const { account, library: provider, networkId } = context

  const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
  const conditionalTokens = useMemo(() => new ConditionalTokenService(conditionalTokensAddress, provider, account), [
    conditionalTokensAddress,
    provider,
    account,
  ])

  const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
  const marketMakerFactory = useMemo(
    () => new MarketMakerFactoryService(marketMakerFactoryAddress, provider, account),
    [marketMakerFactoryAddress, provider, account],
  )

  const realitioAddress = getContractAddress(networkId, 'realitio')
  const realitioScalarAdapterAddress = getContractAddress(networkId, 'realitioScalarAdapter')
  const realitio = useMemo(
    () => new RealitioService(realitioAddress, realitioScalarAdapterAddress, provider, account),
    [realitioAddress, provider, account, realitioScalarAdapterAddress],
  )

  const oracleAddress = getContractAddress(networkId, 'oracle')
  const oracle = useMemo(() => new OracleService(oracleAddress, provider, account), [oracleAddress, provider, account])

  const klerosBadgeAddress = getContractAddress(networkId, 'klerosBadge')
  const klerosTokenViewAddress = getContractAddress(networkId, 'klerosTokenView')
  const klerosTCRAddress = getContractAddress(networkId, 'klerosTCR')
  const kleros = useMemo(
    () => new KlerosService(klerosBadgeAddress, klerosTokenViewAddress, klerosTCRAddress, provider, account),
    [klerosBadgeAddress, klerosTokenViewAddress, klerosTCRAddress, provider, account],
  )

  const buildMarketMaker = useMemo(
    () => (address: string) => new MarketMakerService(address, conditionalTokens, realitio, provider, account),
    [conditionalTokens, realitio, provider, account],
  )

  const dxTCRAddress = getContractAddress(networkId, 'dxTCR')
  const dxTCR = useMemo(() => new DxTCRService(dxTCRAddress, provider), [provider, dxTCRAddress])

  return useMemo(
    () => ({
      conditionalTokens,
      marketMakerFactory,
      realitio,
      oracle,
      buildMarketMaker,
      kleros,
      dxTCR,
    }),
    [conditionalTokens, marketMakerFactory, realitio, oracle, kleros, buildMarketMaker, dxTCR],
  )
}

export type Contracts = ReturnType<typeof useContracts>
