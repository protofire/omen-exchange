import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import proxyAbi from '../abi/gnosisSafe.json'

class SafeService {
  safe: any

  constructor(address: string, provider: any) {
    this.safe = new ethers.Contract(address, proxyAbi, provider)
  }

  encodeChangeMasterCopy = (targetImplementation: string): string => {
    return this.safe.interface.functions.changeMasterCopy.encode([targetImplementation])
  }

  getMasterCopy = async (): Promise<string> => {
    return this.safe.masterCopy()
  }

  getThreshold = async (): Promise<BigNumber> => {
    return this.safe.getThreshold()
  }

  getNonce = async (): Promise<number> => {
    return this.safe.nonce()
  }

  getOwners = async (): Promise<ArrayLike<number>> => {
    return this.safe.getOwners()
  }
}

export { SafeService }
