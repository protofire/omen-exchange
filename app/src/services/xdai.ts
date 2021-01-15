import { abi } from '@kleros/tcr/build/contracts/GeneralizedTCR.json'
import { ethers } from 'ethers'

class XdaiService {
  abi: any

  constructor() {
    this.abi = abi
  }
}

export { XdaiService }
