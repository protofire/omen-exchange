import { ethers } from 'ethers'

import { getLogger } from '../util/logger'
import { getContractAddress } from '../util/addresses'
import { BigNumberish, BigNumber } from 'ethers/utils'

const logger = getLogger('Services::Conditional-Token')

const conditionTokenAbi = [
  'function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external',
  'function reportPayouts(bytes32 questionId, uint[] payouts) external',
  'function payoutDenominator(bytes32) public view returns (uint)',
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

    // Use signer address only for development
    const oracleAddress =
      process.env.NODE_ENV === 'development'
        ? signer.getAddress()
        : getContractAddress(networkId, 'realitioArbitrator')

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

  static reportPayouts = async (
    questionId: string,
    payouts: BigNumberish[],
    networkId: number,
    provider: any,
  ): Promise<any> => {
    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')

    const conditionalTokensContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    )
    return await conditionalTokensContract.reportPayouts(questionId, payouts)
  }

  static isConditionResolved = async (
    conditionId: string,
    networkId: number,
    provider: any,
  ): Promise<boolean> => {
    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')

    const conditionalTokensContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    )
    const payoutDenominator: BigNumber = await conditionalTokensContract.payoutDenominator(
      conditionId,
    )

    return !payoutDenominator.isZero()
  }
}

export { ConditionalTokenService }
