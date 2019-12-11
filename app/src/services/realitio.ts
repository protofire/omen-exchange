import { Contract, ethers, Wallet } from 'ethers'
import { BigNumber, bigNumberify } from 'ethers/utils'
import { Moment } from 'moment'
import RealitioQuestionLib from '@realitio/realitio-lib/formatters/question'
import RealitioTemplateLib from '@realitio/realitio-lib/formatters/template'

import { REALITIO_TIMEOUT, SINGLE_SELECT_TEMPLATE_ID } from '../common/constants'
import { getLogger } from '../util/logger'
import { OutcomeSlot, Question, QuestionLog } from '../util/types'
import { Outcome } from '../components/common/outcomes'

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
    outcomes: Outcome[],
    category: string,
    arbitratorAddress: string,
    openingDateMoment: Moment,
  ): Promise<string> => {
    const openingTimestamp = openingDateMoment.unix()
    const outcomeNames = outcomes.map((outcome: Outcome) => outcome.name)
    const questionText = RealitioQuestionLib.encodeText(
      'single-select',
      question,
      outcomeNames,
      category,
    )
    const args = [
      SINGLE_SELECT_TEMPLATE_ID,
      questionText,
      arbitratorAddress,
      REALITIO_TIMEOUT,
      openingTimestamp,
      0,
    ]

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

    const { question, template_id: templateId, opening_ts: openingTs, arbitrator } = event.values

    const templates = ['bool', 'uint', 'single-select', 'multiple-select', 'datetime']

    const templateType = templates[(templateId as BigNumber).toNumber()]

    const template = RealitioTemplateLib.defaultTemplateForType(templateType)
    const questionLog: QuestionLog = RealitioQuestionLib.populatedJSONForTemplate(
      template,
      question,
    )

    const { category, title, outcomes = [OutcomeSlot.Yes, OutcomeSlot.No] } = questionLog

    return {
      question: title === 'undefined' ? '' : title,
      category: category === 'undefined' ? '' : category,
      resolution: new Date(openingTs * 1000),
      arbitratorAddress: arbitrator,
      outcomes: outcomes,
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
