import { Contract, ethers, Wallet } from 'ethers'
import { bigNumberify } from 'ethers/utils'
import { Moment } from 'moment'
import RealitioQuestionLib from '@realitio/realitio-lib/formatters/question'
import RealitioTemplateLib from '@realitio/realitio-lib/formatters/template'

import { REALITIO_TIMEOUT } from '../common/constants'
import { getLogger } from '../util/logger'
import { Question, QuestionLog } from '../util/types'

const logger = getLogger('Services::Realitio')

const realitioAbi = [
  'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public payable returns (bytes32)',
  'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)',
  'function isFinalized(bytes32 question_id) view public returns (bool)',
  'function resultFor(bytes32 question_id) external view returns (bytes32)',
]
const realitioCallAbi = [
  'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public constant returns (bytes32)',
]

class RealitioService {
  contract: Contract
  constantContract: Contract
  signerAddress: Maybe<string>
  provider: any

  constructor(address: string, provider: any, signerAddress: Maybe<string>) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()

      this.contract = new ethers.Contract(address, realitioAbi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, realitioAbi, provider)
    }

    this.constantContract = new ethers.Contract(address, realitioCallAbi, provider)
    this.signerAddress = signerAddress
    this.provider = provider
  }

  /**
   * Create a question in the realit.io contract. Returns a promise that resolves when the transaction is mined.
   *
   * @param question - The question to ask
   * @param openingTimestamp - The moment after which the question can be answered, specified in epoch seconds
   * @param provider - ethers.js provider obtained from the web3 context
   * @param networkId - the current network id
   * @param value - The amount of value to send, specified in wei
   *
   * @returns A promise that resolves to a string with the bytes32 corresponding to the id of the
   * question
   */
  askQuestion = async (
    question: string,
    category: string,
    arbitratorAddress: string,
    openingDateMoment: Moment,
  ): Promise<string> => {
    const openingTimestamp = openingDateMoment.unix()
    const questionText = RealitioQuestionLib.encodeText('bool', question, null, category)
    const args = [0, questionText, arbitratorAddress, REALITIO_TIMEOUT, openingTimestamp, 0]

    const questionId = await this.constantContract.askQuestion(...args, {
      from: this.signerAddress,
    })

    // send the transaction and wait until it's mined
    const transactionObject = await this.contract.askQuestion(...args, {
      value: '0x0',
    })
    logger.log(`Ask question transaction hash: ${transactionObject.hash}`)
    await this.provider.waitForTransaction(transactionObject.hash)

    return questionId
  }

  getQuestion = async (questionId: string): Promise<Question> => {
    const filter: any = this.contract.filters.LogNewQuestion(questionId)

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: 1,
      toBlock: 'latest',
    })

    if (logs.length === 0) {
      throw new Error(`No LogNewQuestion event found for questionId '${questionId}'`)
    }
    if (logs.length > 1) {
      logger.warn(`There should be only one LogNewQuestion event for questionId '${questionId}'`)
    }

    const iface = new ethers.utils.Interface(realitioAbi)
    const event = iface.parseLog(logs[0])

    const questionLog: QuestionLog = RealitioQuestionLib.populatedJSONForTemplate(
      RealitioTemplateLib.defaultTemplateForType('bool'),
      event.values.question,
    )

    const category = questionLog.category === 'undefined' ? '' : questionLog.category
    const question = questionLog.title === 'undefined' ? '' : questionLog.title

    return {
      question,
      category,
      resolution: new Date(event.values.opening_ts * 1000),
      arbitratorAddress: event.values.arbitrator,
    }
  }

  isFinalized = async (questionId: string): Promise<boolean> => {
    try {
      const isFinalized = await this.contract.isFinalized(questionId)
      return isFinalized
    } catch (err) {
      logger.error(
        `There was an error querying if the question with id '${questionId}' is finalized`,
        err.message,
      )
      throw err
    }
  }

  getWinnerOutcome = async (questionId: string): Promise<number> => {
    try {
      const result: string = await this.contract.resultFor(questionId)
      const resultBN = bigNumberify(result)
      return resultBN.isZero() ? 0 : 1
    } catch (err) {
      logger.error(
        `There was an error querying the result for question with id '${questionId}'`,
        err.message,
      )
      throw err
    }
  }
}

export { RealitioService }
