import { Contract, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { ConditionalTokenService } from './conditional_token'
import { MarketMakerService } from './market_maker'

const WRAPPER_FACTORY_INTERFACE = new utils.Interface([
  `function createWrapper(string _name, string _symbol, uint256 _positionId) external`,
  `function wrappedPosition(uint256 _position) public view returns(bool)`,
])

class ERC20WrapperFactoryService {
  public readonly contract: Contract

  constructor(address: string, provider: any) {
    this.contract = new Contract(address, WRAPPER_FACTORY_INTERFACE, provider)
  }

  get address(): string {
    return this.contract.address
  }

  static encodeCreateWrapperCall = (name: string, symbol: string, positionId: BigNumber): string => {
    return WRAPPER_FACTORY_INTERFACE.functions.createWrapper.encode([name, symbol, positionId])
  }

  marketWrapped = async (
    conditionalTokens: ConditionalTokenService,
    marketMaker: MarketMakerService,
    outcomesAmount: number,
  ): Promise<boolean> => {
    const collateral = await marketMaker.getCollateralToken()
    for (let i = 0; i < outcomesAmount; i++) {
      const collectionId = await conditionalTokens.getCollectionIdForOutcome(await marketMaker.getConditionId(), 1 << i)
      const positionId = await conditionalTokens.getPositionId(collateral, collectionId)
      if (!(await this.contract.wrappedPosition(positionId))) return false
    }
    return true
  }
}

export { ERC20WrapperFactoryService }
