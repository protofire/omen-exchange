import { Contract, ethers, Wallet } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { ConditionalTokenService } from './conditional_token'
import { RealitioService } from './realitio'
import { getLogger } from '../util/logger'
import { Market, MarketStatus, MarketWithExtraData, OutcomeSlot } from '../util/types'
import { calcDistributionHint, divBN } from '../util/tools'

const logger = getLogger('Services::MarketMaker')

const marketMakerAbi = [
  'function conditionalTokens() external view returns (address)',
  'function balanceOf(address addr) external view returns (uint256)',
  'function collateralToken() external view returns (address)',
  'function fee() external view returns (uint)',
  'function conditionIds(uint256) external view returns (bytes32)',
  'function addFunding(uint addedFunds, uint[] distributionHint) external',
  'function removeFunding(uint sharesToBurn) external',
  'function totalSupply() external view returns (uint256)',
  'function buy(uint investmentAmount, uint outcomeIndex, uint minOutcomeTokensToBuy) external',
  'function calcBuyAmount(uint investmentAmount, uint outcomeIndex) public view returns (uint)',
  'function sell(uint returnAmount, uint outcomeIndex, uint maxOutcomeTokensToSell) external',
  'function calcSellAmount(uint returnAmount, uint outcomeIndex) public view returns (uint)',
]

class MarketMakerService {
  contract: Contract
  conditionalTokens: ConditionalTokenService
  realitio: RealitioService
  provider: any

  constructor(
    address: string,
    conditionalTokens: ConditionalTokenService,
    realitio: RealitioService,
    provider: any,
    signerAddress: Maybe<string>,
  ) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()

      this.contract = new ethers.Contract(address, marketMakerAbi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, marketMakerAbi, provider)
    }

    this.conditionalTokens = conditionalTokens
    this.realitio = realitio
    this.provider = provider
  }

  getConditionalTokens = async (): Promise<string> => {
    return this.contract.conditionalTokens()
  }

  getCollateralToken = async (): Promise<string> => {
    return this.contract.collateralToken()
  }

  getFee = async (): Promise<BigNumber> => {
    return this.contract.fee()
  }

  getConditionId = async () => {
    return await this.contract.conditionIds(0)
  }

  getTotalSupply = async (): Promise<BigNumber> => {
    return this.contract.totalSupply()
  }

  addInitialFunding = async (amount: BigNumber, initialOddsYes: number, initialOddsNo: number) => {
    logger.log(`Add funding to market maker ${amount}`)

    const distributionHint = calcDistributionHint(initialOddsYes, initialOddsNo)

    return this.addFunding(amount, distributionHint)
  }

  addFunding = async (amount: BigNumber, distributionHint: BigNumber[] = []) => {
    logger.log(`Add funding to market maker ${amount}`)

    try {
      const overrides = {
        value: '0x0',
      }
      const transactionObject = await this.contract.addFunding(amount, distributionHint, overrides)
      await this.provider.waitForTransaction(transactionObject.hash)
    } catch (err) {
      logger.error(`There was an error adding '${amount.toString()}' of funding'`, err.message)
      throw err
    }
  }

  removeFunding = async (amount: BigNumber) => {
    logger.log(`Remove funding to market maker ${amount}`)
    return this.contract.removeFunding(amount, {
      value: '0x0',
    })
  }

  static getActualPrice = (balanceInformation: {
    balanceOfForYes: BigNumber
    balanceOfForNo: BigNumber
  }): { actualPriceForYes: number; actualPriceForNo: number } => {
    const { balanceOfForYes, balanceOfForNo } = balanceInformation

    const totalBalance = balanceOfForYes.add(balanceOfForNo)
    const actualPriceForYes = !totalBalance.isZero() ? divBN(balanceOfForNo, totalBalance) : 0
    const actualPriceForNo = !totalBalance.isZero() ? divBN(balanceOfForYes, totalBalance) : 0

    return {
      actualPriceForYes,
      actualPriceForNo,
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

  balanceOf = async (address: string): Promise<BigNumber> => {
    return this.contract.balanceOf(address)
  }

  buy = async (amount: BigNumber, outcome: OutcomeSlot) => {
    const outcomeIndex = outcome === OutcomeSlot.Yes ? 0 : 1
    try {
      const outcomeTokensToBuy = await this.contract.calcBuyAmount(amount, outcomeIndex)
      const transactionObject = await this.contract.buy(amount, outcomeIndex, outcomeTokensToBuy, {
        value: '0x0',
      })
      await this.provider.waitForTransaction(transactionObject.hash)
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

  poolSharesTotalSupply = async (): Promise<BigNumber> => {
    try {
      return this.contract.totalSupply()
    } catch (err) {
      logger.error(`There was an error getting the supply of pool shares`, err.message)
      throw err
    }
  }

  poolSharesBalanceOf = async (address: string): Promise<BigNumber> => {
    try {
      return this.contract.balanceOf(address)
    } catch (err) {
      logger.error(
        `There was an error getting the balance of pool shares for '${address}''`,
        err.message,
      )
      throw err
    }
  }

  sell = async (amount: BigNumber, outcome: OutcomeSlot) => {
    const outcomeIndex = outcome === OutcomeSlot.Yes ? 0 : 1
    try {
      const outcomeTokensToSell = await this.contract.calcSellAmount(amount, outcomeIndex)

      const overrides = {
        value: '0x0',
      }
      const transactionObject = await this.contract.sell(
        amount,
        outcomeIndex,
        outcomeTokensToSell,
        overrides,
      )
      await this.provider.waitForTransaction(transactionObject.hash)
    } catch (err) {
      logger.error(
        `There was an error selling '${amount.toString()}' for outcome '${outcome}'`,
        err.message,
      )
      throw err
    }
  }

  getExtraData = async (market: Market): Promise<MarketWithExtraData> => {
    const { conditionId } = market
    // Get question data
    const questionId = await this.conditionalTokens.getQuestionId(conditionId)
    const { question, resolution, arbitratorAddress, category } = await this.realitio.getQuestion(
      questionId,
    )
    // Know if a market is open or resolved
    const isConditionResolved = await this.conditionalTokens.isConditionResolved(conditionId)
    const marketStatus = isConditionResolved ? MarketStatus.Resolved : MarketStatus.Open

    const fee = await this.getFee()

    return {
      ...market,
      question,
      resolution,
      category,
      arbitratorAddress,
      status: marketStatus,
      fee,
    }
  }
}

export { MarketMakerService }
