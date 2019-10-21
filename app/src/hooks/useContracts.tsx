import { useMemo } from 'react'
import { ConnectedWeb3Context } from './connectedWeb3'
import { getContractAddress } from '../util/addresses'
import { ConditionalTokenService, MarketMakerFactoryService, RealitioService } from '../services'

export const useContracts = (context: ConnectedWeb3Context) => {
  const { account, library, networkId } = context
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
  const arbitratorAddress = getContractAddress(networkId, 'realitioArbitrator')
  const realitio = useMemo(
    () => new RealitioService(realitioAddress, library, account, arbitratorAddress),
    [realitioAddress, library, account, arbitratorAddress],
  )

  return {
    conditionalTokens,
    marketMakerFactory,
    realitio,
  }
}
