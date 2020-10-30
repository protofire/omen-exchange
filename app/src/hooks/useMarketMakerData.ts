import { useConnectedWeb3Context } from './connectedWeb3'
import { useBlockchainMarketMakerData } from './useBlockchainMarketMakerData'
import { useGraphMarketMakerData } from './useGraphMarketMakerData'

export const useMarketMakerData = (marketMakerAddress: string) => {
  const { networkId } = useConnectedWeb3Context()
  const { marketMakerData: graphMarketMakerData } = useGraphMarketMakerData(marketMakerAddress, networkId)
  const { fetchData, marketMakerData } = useBlockchainMarketMakerData(graphMarketMakerData, networkId)
  return { fetchData, marketMakerData }
}
