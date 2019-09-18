import { ethers } from 'ethers'

import { getLogger } from '../util/logger'
import { getContractAddress } from '../util/addresses'

const logger = getLogger('Services::Conditional-Token')

const conditionTokenAbi = [
  'function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external',
]

class ConditionalTokenService {
  static prepareCondition = async (
    questionId: string,
    provider: any,
    networkId: number,
    outcomeSlotCount = 2,
  ): Promise<string> => {
    const signer = provider.getSigner()

    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
    const conditionalTokenContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    ).connect(signer)

    const oracleAddress = getContractAddress(networkId, 'realitioArbitrator')

    const transactionObject = await conditionalTokenContract.prepareCondition(
      oracleAddress,
      questionId,
      outcomeSlotCount,
    )
    logger.log(`Prepare condition transaction hash: ${transactionObject.hash}`)

    const conditionId = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint256'],
      [oracleAddress, questionId, outcomeSlotCount],
    )

    return conditionId
  }
}

export { ConditionalTokenService }
