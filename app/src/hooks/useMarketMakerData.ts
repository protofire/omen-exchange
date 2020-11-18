import { useWeb3React } from '@web3-react/core'

import { useBlockchainMarketMakerData } from './useBlockchainMarketMakerData'
import { useGraphMarketMakerData } from './useGraphMarketMakerData'

export const useMarketMakerData = (marketMakerAddress: string) => {
  const context = useWeb3React()
  const chainId = context.chainId == null ? 1 : context.chainId

  const { fetchData: fetchGraphMarketMakerData, marketMakerData: graphMarketMakerData } = useGraphMarketMakerData(
    marketMakerAddress,
    chainId,
  )
  const { fetchData, marketMakerData } = useBlockchainMarketMakerData(graphMarketMakerData, chainId)
  return { fetchData, marketMakerData, fetchGraphMarketMakerData }
}
