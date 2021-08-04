import { useConnectedWeb3Context } from '../../contexts'
import { useGraphMarketMakerData } from '../graph/useGraphMarketMakerData'

import { useBlockchainMarketMakerData } from './useBlockchainMarketMakerData'

export const useMarketMakerData = (marketMakerAddress: string) => {
  const { networkId } = useConnectedWeb3Context()
  const { fetchData: fetchGraphMarketMakerData, marketMakerData: graphMarketMakerData } = useGraphMarketMakerData(
    marketMakerAddress,
    networkId,
  )
  const { fetchData, marketMakerData, status } = useBlockchainMarketMakerData(graphMarketMakerData, networkId)
  return { fetchData, marketMakerData, fetchGraphMarketMakerData, status }
}
