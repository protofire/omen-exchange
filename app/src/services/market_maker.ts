import { Contract, ethers, Wallet } from 'ethers'
import { BigNumber, BigNumberish } from 'ethers/utils'

import { ConditionalTokenService } from './conditional_token'
import { getLogger } from '../util/logger'

const logger = getLogger('Services::MarketMaker')

const marketMakerAbi = [
  'function conditionalTokens() external view returns (address)',
  'function collateralToken() external view returns (address)',
  'function fee() external view returns (uint)',
  'function conditionIds(uint256) external view returns (bytes32)',
  'function addFunding(uint addedFunds, uint[] distributionHint) external',
  'function totalSupply() external view returns (uint256)',
  'function calcMarginalPrice(uint8 outcomeTokenIndex) view returns (uint price)',
  'function owner() public view returns (address)',
  'function trade(int[] outcomeTokenAmounts, int collateralLimit) public returns (int netCost)',
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

  getConditionalToken = async (): Promise<string> => {
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

  getOwner = async (): Promise<string> => {
    return await this.contract.owner()
  }

  getTotalSupply = async (): Promise<any> => {
    return await this.contract.totalSupply()
  }

  addFunding = async (amount: BigNumber) => {
    logger.log(`Add funding to market maker ${amount}`)
    this.contract.addFunding(amount, [])
  }

  getActualPrice = async (): Promise<any> => {
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

  getBalanceInformation = async (ownerAddress: string): Promise<any> => {
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

  trade = async (outcomeTokenAmounts: BigNumberish[]) => {
    await this.contract.trade(outcomeTokenAmounts, 0)
  }

  withdrawFees = async () => {
    await this.contract.withdrawFees()
  }
}

export { MarketMakerService }
