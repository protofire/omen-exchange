import { ethers } from 'ethers'

enum Stage {
  Running = 0,
  Paused = 1,
  Closed = 2,
}

const LMSRMarketMakerAbi = [
  'function pmSystem() external view returns (address)',
  'function collateralToken() external view returns (address)',
  'function stage() external view returns (uint8)',
  'function funding() external view returns (uint256)',
  'function atomicOutcomeSlotCount() external view returns (uint256)',
  'function fee() external view returns (uint64)',
  'function conditionIds(uint256) external view returns (bytes32)',
]

class FetchMarketService {
  contract: any

  constructor(address: string, provider: any) {
    this.contract = new ethers.Contract(address, LMSRMarketMakerAbi, provider)
  }

  async getFunding(): Promise<any> {
    return await this.contract.funding()
  }

  async getFee(): Promise<any> {
    return await this.contract.fee()
  }

  async getConditionIds() {
    return await this.contract.conditionIds(0)
  }

  async getOutcomeSlots(): Promise<any> {
    return await this.contract.atomicOutcomeSlotCount()
  }

  async getStage(): Promise<Stage> {
    return await this.contract.stage()
  }

  async getCollateralToken(): Promise<any> {
    return await this.contract.collateralToken()
  }

  async getConditionalToken(): Promise<any> {
    return await this.contract.pmSystem()
  }

  async getMarket(): Promise<any> {
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
      this.getStage(),
      this.getConditionIds(),
      this.getOutcomeSlots(),
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
