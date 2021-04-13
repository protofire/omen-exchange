import { useEffect, useState } from 'react'

import { ERC20Service } from '../services'
import { ERC20WrapperService } from '../services/erc20_wrapper'

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
        wrappers.push(
          new ERC20Service(
            web3Context.library,
            web3Context.account,
            ERC20WrapperService.predictAddress(erc20WrapperFactory.address, positionId),
          ),
        )
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
