import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

const proxyAbi = [
  'function masterCopy() external view returns (address)',
  'function changeMasterCopy(address _masterCopy) external',
  'function swapOwner(address prevOwner, address oldOwner, address newOwner) external',
  'function getOwners() public view returns (address[] memory)',
  'function getThreshold() public view returns (uint256)',
  'function nonce() public view returns (uint256)',
]

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
