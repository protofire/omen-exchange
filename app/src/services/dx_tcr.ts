import { Contract, ethers } from 'ethers'
import { BigNumberish } from 'ethers/utils'

import dxTCRAbi from '../abi/dxTcr.json'

export class DxTCRService {
  contract: Contract
  provider: any

  constructor(address: string, provider: any) {
    this.contract = new ethers.Contract(address, dxTCRAbi, provider)
    this.provider = provider
  }

  get address(): string {
    return this.contract.address
  }

  getTokens = async (listId: BigNumberish): Promise<string[]> => {
    return this.contract.getTokens(listId)
  }
}
