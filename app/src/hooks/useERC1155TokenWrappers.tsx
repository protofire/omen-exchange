import { useEffect, useState } from 'react'

import { MarketMakerService } from '../services'
import { ERC20WrapperService } from '../services/erc20_wrapper'

import { useConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

/**
 * Given a certain condition id, the amount of outcomes and a specific collateral token,
 * returns the addresses of the ERC20 token wrappers for each position, if any.
 * If the market does not support ERC20 wrapping (due to being too old for example),
 * `null` is returned.
 *
 * @param conditionId The condition id.
 * @param outcomesAmount The amount of outcomes.
 * @param collateralAddress The collateral address.
 */
export const useERC1155TokenWrappers = (
  marketMaker: MarketMakerService,
  conditionId: string,
  outcomesAmount: number,
  collateralAddress: string,
): ERC20WrapperService[] | null => {
  const web3Context = useConnectedWeb3Context()
  const { conditionalTokens, erc20WrapperFactory } = useContracts(web3Context)
  const [wrappers, setWrappers] = useState<ERC20WrapperService[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!(await erc20WrapperFactory.marketWrapped(conditionalTokens, marketMaker, outcomesAmount))) {
        setWrappers(null)
        return
      }
      const wrappers = []
      for (let i = 0; i < outcomesAmount; i++) {
        const collectionId = await conditionalTokens.getCollectionIdForOutcome(conditionId, 1 << i)
        const positionId = await conditionalTokens.getPositionId(collateralAddress, collectionId)
        wrappers.push(
          new ERC20WrapperService(
            ERC20WrapperService.predictAddress(erc20WrapperFactory.address, positionId),
            positionId,
            web3Context.library,
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
    marketMaker,
  ])

  return wrappers
}
