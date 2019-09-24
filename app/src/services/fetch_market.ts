import { ethers } from 'ethers'
import LMSRMarketMaker from './abis/LMSRMarketMaker.json'

enum Stage {
  Running = 0,
  Paused = 1,
  Closed = 2,
}

class FetchMarketService {
  address: string
  contract: any

  constructor(address: string, provider: any) {
    this.address = address
    this.contract = new ethers.Contract(address, LMSRMarketMaker.abi, provider)
  }

  async getFunding(): Promise<any> {
    return await this.contract.functions.funding()
  }

  async getFee(): Promise<any> {
    return await this.contract.functions.fee()
  }

  async getConditionIds() {
    return await this.contract.functions.conditionIds(0)
  }

  async getOutcomeSlots(): Promise<any> {
    return await this.contract.functions.atomicOutcomeSlotCount()
  }

  async getStage(): Promise<Stage> {
    return await this.contract.functions.stage()
  }

  async getCollateralToken(): Promise<any> {
    return await this.contract.functions.pmSystem()
  }

  async getMarket(): Promise<any> {
    const [funding, fee, conditionId, outcomeSlots, stage, collateralToken] = await Promise.all([
      this.getFunding(),
      this.getFee(),
      this.getConditionIds(),
      this.getOutcomeSlots(),
      this.getOutcomeSlots(),
      this.getCollateralToken(),
    ])

    return {
      funding,
      fee,
      conditionId,
      outcomeSlots,
      stage,
      collateralToken,
    }
  }
}

export { FetchMarketService }
