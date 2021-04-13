import { useEffect, useState } from 'react'

import { ERC20Service } from '../services'

import { useConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

export const useERC1155TokenWrappers = (conditionId: string, outcomesAmount: number, collateralAddress: string) => {
  const web3Context = useConnectedWeb3Context()
  const { conditionalTokens, erc20WrapperFactory } = useContracts(web3Context)
  const [wrappers, setWrappers] = useState<ERC20Service[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const wrappers = []
      for (let i = 0; i < outcomesAmount; i++) {
        const collectionId = await conditionalTokens.getCollectionIdForOutcome(conditionId, 1 << i)
        const positionId = await conditionalTokens.getPositionId(collateralAddress, collectionId)
        const erc20WrapperAddress = await erc20WrapperFactory.wrapperForPosition(positionId)
        wrappers.push(new ERC20Service(web3Context.library, web3Context.account, erc20WrapperAddress))
      }
      setWrappers(wrappers)
    }
    fetchData()
  }, [
    collateralAddress,
    conditionId,
    conditionalTokens,
    erc20WrapperFactory,
    outcomesAmount,
    web3Context.account,
    web3Context.library,
  ])

  return wrappers
}
