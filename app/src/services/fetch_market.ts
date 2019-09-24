import { ethers } from 'ethers'
import { getContractAddress } from '../util/addresses'

enum Stage {
  Running = 0,
  Paused = 1,
  Closed = 2,
}

const marketMakerAbi = [
  'function pmSystem() external view returns (address)',
  'function collateralToken() external view returns (address)',
  'function stage() external view returns (uint8)',
  'function funding() external view returns (uint256)',
  'function atomicOutcomeSlotCount() external view returns (uint256)',
  'function fee() external view returns (uint64)',
  'function conditionIds(uint256) external view returns (bytes32)',
]

const conditionTokenAbi = [
  'function getCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint indexSet) external view returns (bytes32) ',
  'function getPositionId(address collateralToken, bytes32 collectionId) external pure returns (uint) ',
  'function balanceOf(address owner, uint256 positionId) external view returns (uint256)',
]

class FetchMarketService {
  marketMakerContract: any
  conditionalTokensContract: any
  daiTokenAddress: string
  ownerAddress: string

  constructor(marketMakerAddress: string, ownerAddress: string, networkId: number, provider: any) {
    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')

    this.marketMakerContract = new ethers.Contract(marketMakerAddress, marketMakerAbi, provider)
    this.conditionalTokensContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    )
    this.daiTokenAddress = getContractAddress(networkId, 'dai')
    this.ownerAddress = ownerAddress
  }

  async getFunding(): Promise<any> {
    return await this.marketMakerContract.funding()
  }

  async getFee(): Promise<any> {
    return await this.marketMakerContract.fee()
  }

  async getConditionIds() {
    return await this.marketMakerContract.conditionIds(0)
  }

  async getOutcomeSlots(): Promise<any> {
    return await this.marketMakerContract.atomicOutcomeSlotCount()
  }

  async getStage(): Promise<Stage> {
    return await this.marketMakerContract.stage()
  }

  async getCollateralToken(): Promise<any> {
    return await this.marketMakerContract.collateralToken()
  }

  async getConditionalToken(): Promise<any> {
    return await this.marketMakerContract.pmSystem()
  }

  async getCollectionIdForYes(conditionId: string): Promise<any> {
    return await this.conditionalTokensContract.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      1,
    )
  }

  async getCollectionIdForNo(conditionId: string): Promise<any> {
    return await this.conditionalTokensContract.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      2,
    )
  }

  async getPositionId(collectionId: string): Promise<any> {
    return await this.conditionalTokensContract.getPositionId(this.daiTokenAddress, collectionId)
  }

  async getBalanceOf(positionId: string): Promise<any> {
    return await this.conditionalTokensContract.balanceOf(this.ownerAddress, positionId)
  }

  async getBalanceInformation(): Promise<any> {
    const conditionId = await this.getConditionIds()
    const [collectionIdForYes, collectionIdForNo] = await Promise.all([
      this.getCollectionIdForYes(conditionId),
      this.getCollectionIdForNo(conditionId),
    ])

    const [positionIdForYes, positionIdForNo] = await Promise.all([
      this.getPositionId(collectionIdForYes),
      this.getPositionId(collectionIdForNo),
    ])

    const [balanceOfForYes, balanceOfForNo] = await Promise.all([
      this.getBalanceOf(positionIdForYes),
      this.getBalanceOf(positionIdForNo),
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
      this.getConditionIds(),
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
}

export { FetchMarketService }
