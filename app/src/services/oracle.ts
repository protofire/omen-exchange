import { Contract, Wallet, ethers, utils } from 'ethers'
import { TransactionReceipt } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'

import { getLogger } from '../util/logger'
import { Question } from '../util/types'

const logger = getLogger('Services::Oracle')

const oracleAbi = [
  'function resolve(bytes32 questionId, uint256 templateId, string question, uint256 numOutcomes) external',
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

  get address(): string {
    return this.contract.address
  }

  /**
   * Resolve the condition with the given questionId
   */
  resolveCondition = async (question: Question, numOutcomes: number): Promise<TransactionReceipt> => {
    try {
      const transactionObject = await this.contract.resolve(question.id, question.templateId, question.raw, numOutcomes)
      return this.provider.waitForTransaction(transactionObject.hash)
    } catch (err) {
      logger.error(`There was an error resolving the condition with question id '${question.id}'`, err.message)
      throw err
    }
  }

  static encodeResolveCondition = (
    questionId: string,
    questionTemplateId: number,
    questionRaw: string,
    numOutcomes: number,
  ): string => {
    const oracleInterface = new utils.Interface(oracleAbi)

    return oracleInterface.functions.resolve.encode([questionId, questionTemplateId, questionRaw, numOutcomes])
  }

  static getPayouts = (templateId: number, realitioAnswer: string, numOutcomes: number): number[] => {
    let payouts: number[]
    if (realitioAnswer === '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
      payouts = [...Array(numOutcomes)].map(() => 1)
    }

    const answer = new BigNumber(realitioAnswer).toNumber()

    if (templateId === 0 || templateId === 2) {
      payouts = [...Array(numOutcomes)].map(() => 0)
      payouts[answer] = 1
    } else if (templateId === 5 || templateId === 6) {
      payouts = [0, 0]

      payouts[0] = 4 - answer
      payouts[1] = answer
    } else {
      throw new Error(`Unsupported template id: '${templateId}'`)
    }

    const totalPayouts = payouts.reduce((a, b) => a + b)

    return payouts.map(payout => payout / totalPayouts)
  }
}
