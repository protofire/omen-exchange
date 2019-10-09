import { Contract, ethers, Wallet } from 'ethers'
import { BigNumber, BigNumberish } from 'ethers/utils'

import { Stage } from '../util/types'
import { ConditionalTokenService } from './conditional_token'

const marketMakerAbi = [
  'function pmSystem() external view returns (address)',
  'function collateralToken() external view returns (address)',
  'function stage() external view returns (uint8)',
  'function funding() external view returns (uint256)',
  'function atomicOutcomeSlotCount() external view returns (uint256)',
  'function fee() external view returns (uint64)',
  'function conditionIds(uint256) external view returns (bytes32)',
  'function calcMarginalPrice(uint8 outcomeTokenIndex) view returns (uint price)',
  'function owner() public view returns (address)',
  'function trade(int[] outcomeTokenAmounts, int collateralLimit) public returns (int netCost)',
  'function calcNetCost(int[] outcomeTokenAmounts) public view returns (int netCost)',
  'function calcMarketFee(uint outcomeTokenCost) public view returns (uint)',
  'function withdrawFees() public returns (uint fees)',
]

class MarketMakerService {
  contract: Contract
  conditionalTokens: ConditionalTokenService

  constructor(address: string, conditionalTokens: ConditionalTokenService, provider: any) {
    const signer: Wallet = provider.getSigner()

    this.contract = new ethers.Contract(address, marketMakerAbi, provider).connect(signer)
    this.conditionalTokens = conditionalTokens
  }

  async getFunding(): Promise<any> {
    return await this.contract.funding()
  }

  async getFee(): Promise<any> {
    return await this.contract.fee()
  }

  async getConditionId() {
    return await this.contract.conditionIds(0)
  }

  async getOutcomeSlots(): Promise<any> {
    return await this.contract.atomicOutcomeSlotCount()
  }

  async getStage(): Promise<Stage> {
    return await this.contract.stage()
  }

  async getCollateralToken(): Promise<string> {
    return await this.contract.collateralToken()
  }

  async getOwner(): Promise<string> {
    return await this.contract.owner()
  }

  async getConditionalToken(): Promise<string> {
    return await this.contract.pmSystem()
  }

  async getActualPrice(): Promise<any> {
    let [actualPriceForYes, actualPriceForNo] = await Promise.all([
      this.contract.calcMarginalPrice(0),
      this.contract.calcMarginalPrice(1),
    ])

    const two = new BigNumber(2)
    const twoPower64 = two.pow(64)

    actualPriceForYes =
      actualPriceForYes
        .mul(new BigNumber(10000))
        .div(twoPower64)
        .toNumber() / 10000
    actualPriceForNo =
      actualPriceForNo
        .mul(new BigNumber(10000))
        .div(twoPower64)
        .toNumber() / 10000

    return {
      actualPriceForYes,
      actualPriceForNo,
    }
  }

  async getBalanceInformation(ownerAddress: string): Promise<any> {
    const conditionId = await this.getConditionId()
    const collateralTokenAddress = await this.getCollateralToken()

    const [collectionIdForYes, collectionIdForNo] = await Promise.all([
      this.conditionalTokens.getCollectionIdForYes(conditionId),
      this.conditionalTokens.getCollectionIdForNo(conditionId),
    ])

    const [positionIdForYes, positionIdForNo] = await Promise.all([
      this.conditionalTokens.getPositionId(collateralTokenAddress, collectionIdForYes),
      this.conditionalTokens.getPositionId(collateralTokenAddress, collectionIdForNo),
    ])

    const [balanceOfForYes, balanceOfForNo] = await Promise.all([
      this.conditionalTokens.getBalanceOf(ownerAddress, positionIdForYes),
      this.conditionalTokens.getBalanceOf(ownerAddress, positionIdForNo),
    ])

    return {
      balanceOfForYes,
      balanceOfForNo,
    }
  }

  async getMarketInformation(): Promise<any> {
    const [
      funding,
      fee,
      conditionId,
      outcomeSlots,
      stage,
      collateralToken,
      conditionalToken,
    ] = await Promise.all([
      this.getFunding(),
      this.getFee(),
      this.getConditionId(),
      this.getOutcomeSlots(),
      this.getStage(),
      this.getCollateralToken(),
      this.getConditionalToken(),
    ])

    return {
      funding,
      fee,
      conditionId,
      outcomeSlots,
      stage,
      collateralToken,
      conditionalToken,
    }
  }

  trade = async (outcomeTokenAmounts: BigNumberish[]) => {
    await this.contract.trade(outcomeTokenAmounts, 0)
  }

  withdrawFees = async () => {
    await this.contract.withdrawFees()
  }

  calculateNetCost = async (outcomeTokenAmounts: BigNumberish[]) => {
    return await this.contract.calcNetCost(outcomeTokenAmounts)
  }

  calculateMarketFee = async (outcomeTokenCost: BigNumberish) => {
    return await this.contract.calcMarketFee(outcomeTokenCost)
  }
}

export { MarketMakerService }
