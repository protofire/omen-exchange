import { abi } from '@kleros/tcr/build/contracts/GeneralizedTCR.json'
import { ethers } from 'ethers'

class OvmService {
  abi: any

  constructor() {
    this.abi = abi
  }

  createOvmContractInstance = async (signer: any, ovmAddress: any) => {
    const contract = new ethers.Contract(ovmAddress, this.abi, signer)
    return contract
  }
  generateTransaction = async (params: any, contract: any, deposit: any) => {
    try {
      if (!params || !contract || !deposit) return false
      const transaction = await contract.addItem(params, {
        value: ethers.utils.bigNumberify(deposit),
      })
      return transaction ? transaction : 'invalid'
    } catch (e) {
      throw new Error('Failed at generating transaction!')
      return false
    }
  }
}

export { OvmService }
