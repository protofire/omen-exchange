import { MarketMakerData } from '../util/types'

import { useConnectedWeb3Context } from './connectedWeb3'
import { useBlockchainMarketMakerData, useMyBlockchainMarketMakerData } from './useBlockchainMarketMakerData'
import { useGraphMarketMakerData } from './useGraphMarketMakerData'

export const useMarketMakerData = (marketMakerAddress: string) => {
  const { networkId } = useConnectedWeb3Context()
  const { fetchData: fetchGraphMarketMakerData, marketMakerData: graphMarketMakerData } = useGraphMarketMakerData(
    networkId,
    false,
    marketMakerAddress,
  )
  const { fetchData, marketMakerData } = useBlockchainMarketMakerData(graphMarketMakerData, networkId)
  return { fetchData, marketMakerData, fetchGraphMarketMakerData }
}

export const useAllMyMarketData = () => {
  const { networkId } = useConnectedWeb3Context()
  const { fetchData: fetchGraphMarketMakerData, marketMakerData: graphMarketMakerData } = useGraphMarketMakerData(
    networkId,
    true,
  )
  const { fetchData, marketMakerData } = useMyBlockchainMarketMakerData(graphMarketMakerData, networkId)
  return { fetchData, marketMakerData, fetchGraphMarketMakerData }
}
