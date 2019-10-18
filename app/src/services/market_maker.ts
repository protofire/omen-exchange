import { Contract, ethers, Wallet } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { ConditionalTokenService } from './conditional_token'
import { getLogger } from '../util/logger'
import { OutcomeSlot } from '../util/types'

const logger = getLogger('Services::MarketMaker')

const marketMakerAbi = [
  'function conditionalTokens() external view returns (address)',
  'function collateralToken() external view returns (address)',
  'function fee() external view returns (uint)',
  'function conditionIds(uint256) external view returns (bytes32)',
  'function addFunding(uint addedFunds, uint[] distributionHint) external',
  'function totalSupply() external view returns (uint256)',
  'function buy(uint investmentAmount, uint outcomeIndex, uint minOutcomeTokensToBuy) external',
  'function calcBuyAmount(uint investmentAmount, uint outcomeIndex) public view returns (uint)',
]

class MarketMakerService {
  contract: Contract
  conditionalTokens: ConditionalTokenService

  constructor(address: string, conditionalTokens: ConditionalTokenService, provider: any) {
    const signer: Wallet = provider.getSigner()

    this.contract = new ethers.Contract(address, marketMakerAbi, provider).connect(signer)
    this.conditionalTokens = conditionalTokens
  }

  getConditionalTokens = async (): Promise<string> => {
    return await this.contract.conditionalTokens()
  }

  getCollateralToken = async (): Promise<string> => {
    return await this.contract.collateralToken()
  }

  getFee = async (): Promise<any> => {
    return await this.contract.fee()
  }

  getConditionId = async () => {
    return await this.contract.conditionIds(0)
  }

  getTotalSupply = async (): Promise<BigNumber> => {
    return await this.contract.totalSupply()
  }

  addFunding = async (amount: BigNumber) => {
    logger.log(`Add funding to market maker ${amount}`)
    this.contract.addFunding(amount, [])
  }

  /* TODO: TBD */
  getActualPrice = async (): Promise<{ actualPriceForYes: number; actualPriceForNo: number }> => {
    // let [actualPriceForYes, actualPriceForNo] = await Promise.all([
    //   this.contract.calcMarginalPrice(0),
    //   this.contract.calcMarginalPrice(1),
    // ])
    //
    // const two = new BigNumber(2)
    // const twoPower64 = two.pow(64)
    //
    // actualPriceForYes =
    //   actualPriceForYes
    //     .mul(new BigNumber(10000))
    //     .div(twoPower64)
    //     .toNumber() / 10000
    // actualPriceForNo =
    //   actualPriceForNo
    //     .mul(new BigNumber(10000))
    //     .div(twoPower64)
    //     .toNumber() / 10000
    //
    return {
      actualPriceForYes: 0.5,
      actualPriceForNo: 0.5,
    }
  }

  getBalanceInformation = async (
    ownerAddress: string,
  ): Promise<{ balanceOfForYes: BigNumber; balanceOfForNo: BigNumber }> => {
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

  buy = async (amount: BigNumber, outcome: OutcomeSlot) => {
    const outcomeIndex = outcome === OutcomeSlot.Yes ? 0 : 1
    try {
      const outcomeTokensToBuy = await this.contract.calcBuyAmount(amount, outcomeIndex)
      await this.contract.buy(amount, outcomeIndex, outcomeTokensToBuy)
    } catch (err) {
      logger.error(
        `There was an error buying '${amount.toString()}' for outcome '${outcome}'`,
        err.message,
      )
      throw err
    }
  }

  calcBuyAmount = async (amount: BigNumber, outcome: OutcomeSlot): Promise<BigNumber> => {
    const outcomeIndex = outcome === OutcomeSlot.Yes ? 0 : 1
    try {
      return this.contract.calcBuyAmount(amount, outcomeIndex)
    } catch (err) {
      logger.error(
        `There was an error computing the buy amount for amount '${amount.toString()}' and outcome '${outcome}'`,
        err.message,
      )
      throw err
    }
  }
}

export { MarketMakerService }
