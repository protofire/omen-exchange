import { Contract, ethers, Wallet } from 'ethers'

import { getLogger } from '../util/logger'

const logger = getLogger('Services::Oracle')

const oracleAbi = [
  'function resolveCondition(bytes32 questionId) public',
  'function resolveSingleSelectCondition(bytes32 questionId, uint256 numOutcomes) public',
]

export class OracleService {
  contract: Contract
  provider: any

  constructor(address: string, provider: any, signerAddress: Maybe<string>) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()
      this.contract = new ethers.Contract(address, oracleAbi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, oracleAbi, provider)
    }
    this.provider = provider
  }

  /**
   * Resolve the condition with the given questionId
   */
  resolveCondition = async (questionId: string, numOutcomes: number): Promise<void> => {
    try {
      const transactionObject = await this.contract.resolveSingleSelectCondition(
        questionId,
        numOutcomes,
      )
      await this.provider.waitForTransaction(transactionObject.hash)
    } catch (err) {
      logger.error(
        `There was an error resolving the condition with questionid '${questionId}'`,
        err.message,
      )
      throw err
    }
  }
}
