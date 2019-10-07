import { useConnectedWeb3Context } from './connectedWeb3'
import { getContractAddress } from '../util/addresses'
import { ConditionalTokenService, MarketMakerFactoryService, RealitioService } from '../services'

export const useContracts = () => {
  const { library, networkId, account } = useConnectedWeb3Context()

  const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
  const conditionalTokens = new ConditionalTokenService(conditionalTokensAddress, library, account)

  const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
  const marketMakerFactory = new MarketMakerFactoryService(
    marketMakerFactoryAddress,
    library,
    account,
  )

  const realitioAddress = getContractAddress(networkId, 'realitio')
  const arbitratorAddress = getContractAddress(networkId, 'realitioArbitrator')
  const realitio = new RealitioService(realitioAddress, library, account, arbitratorAddress)

  return {
    conditionalTokens,
    marketMakerFactory,
    realitio,
  }
}
