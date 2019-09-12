import { ethers } from 'ethers'

import { getContractAddress } from '../util/addresses'

const realitioAbi = [
  'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public payable returns (bytes32)',
]
const realitioCallAbi = [
  'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public constant returns (bytes32)',
]

class RealitioService {
  /**
   * Create a question in the realit.io contract. Returns a promise that resolves when the transaction is mined.
   *
   * @returns {Promise<string>} A promise that resolves to a string with the bytes32 corresponding to the id of the
   * question
   */
  static askQuestion = async (
    question: string,
    openingTimestamp: number,
    provider: any,
    networkId: number,
  ): Promise<string> => {
    const signer = provider.getSigner()

    const realitioAddress = getContractAddress(networkId, 'realitio')
    const arbitrator = getContractAddress(networkId, 'realitioArbitrator')

    // there's no way to call a non-constant method as if it were constant, so we need to instantiate two contracts,
    // with one having an ABI that pretends the method is constant
    const realitioConstantContract = new ethers.Contract(realitioAddress, realitioCallAbi, provider)
    const realitioContract = new ethers.Contract(realitioAddress, realitioAbi, provider).connect(
      signer,
    )

    const questionId = await realitioConstantContract.askQuestion(
      0,
      question,
      arbitrator,
      '86400',
      openingTimestamp,
      0,
    )

    // send the transaction and wait until it's mined
    await realitioContract.askQuestion(0, question, arbitrator, '86400', openingTimestamp, 0)

    return questionId
  }
}

export default RealitioService
