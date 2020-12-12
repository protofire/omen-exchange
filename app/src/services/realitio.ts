import RealitioQuestionLib from '@realitio/realitio-lib/formatters/question'
import RealitioTemplateLib from '@realitio/realitio-lib/formatters/template'
import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber, bigNumberify } from 'ethers/utils'
// eslint-disable-next-line import/named
import { Moment } from 'moment'

import { REALITIO_TIMEOUT, SINGLE_SELECT_TEMPLATE_ID, UINT_TEMPLATE_ID } from '../common/constants'
import { Outcome } from '../components/market/sections/market_create/steps/outcomes'
import { getLogger } from '../util/logger'
import { getEarliestBlockToCheck, getRealitioTimeout } from '../util/networks'
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
const realitioScalarAdapterAbi = [
  'function announceConditionQuestionId(bytes32 questionId, uint256 low, uint256 high)',
  'function resolve(bytes32 questionId, string question, uint256 low, uint256 high)',
]

function getQuestionArgs(
  question: string,
  outcomes: Outcome[],
  category: string,
  arbitratorAddress: string,
  openingDateMoment: Moment,
  networkId: number,
) {
  const openingTimestamp = openingDateMoment.unix()
  const outcomeNames = outcomes.map((outcome: Outcome) => outcome.name)
  const questionText = RealitioQuestionLib.encodeText('single-select', question, outcomeNames, category)

  const timeoutResolution = REALITIO_TIMEOUT || getRealitioTimeout(networkId)

  return [SINGLE_SELECT_TEMPLATE_ID, questionText, arbitratorAddress, timeoutResolution, openingTimestamp, 0]
}

function getScalarQuestionArgs(
  question: string,
  unit: string,
  category: string,
  arbitratorAddress: string,
  openingDateMoment: Moment,
  networkId: number,
) {
  const openingTimestamp = openingDateMoment.unix()
  const questionText = RealitioQuestionLib.encodeText('uint', `${question} [${unit}]`, null, category)

  const timeoutResolution = REALITIO_TIMEOUT || getRealitioTimeout(networkId)

  return [UINT_TEMPLATE_ID, questionText, arbitratorAddress, timeoutResolution, openingTimestamp, 0]
}

class RealitioService {
  contract: Contract
  constantContract: Contract
  scalarContract: Contract
  signerAddress: Maybe<string>
  provider: any

  constructor(address: string, scalarAddress: string, provider: any, signerAddress: Maybe<string>) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()

      this.contract = new ethers.Contract(address, realitioAbi, provider).connect(signer)
      this.scalarContract = new ethers.Contract(scalarAddress, realitioScalarAdapterAbi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, realitioAbi, provider)
      this.scalarContract = new ethers.Contract(scalarAddress, realitioScalarAdapterAbi, provider)
    }

    this.constantContract = new ethers.Contract(address, realitioCallAbi, provider)
    this.signerAddress = signerAddress
    this.provider = provider
  }

  get address(): string {
    return this.contract.address
  }

  /**
   * Create a question in the realit.io contract. Returns a promise that resolves when the transaction is mined.
   *
   * @param question - The question to ask
   * @param outcomes - The outcomes to use with the question
   * @param category - The category of the question
   * @param arbitratorAddress - The address of the arbitrator to use with the question
   * @param openingTimestamp - The moment after which the question can be answered, specified in epoch seconds
   * @param networkId - the current network id
   *
   * @returns A promise that resolves to a string with the bytes32 corresponding to the id of the
   * question
   */
  askQuestion = async (
    arbitratorAddress: string,
    category: string,
    networkId: number,
    openingDateMoment: Moment,
    outcomes: Outcome[],
    question: string,
  ): Promise<string> => {
    const openingTimestamp = openingDateMoment.unix()
    const outcomeNames = outcomes.map((outcome: Outcome) => outcome.name)
    const questionText = RealitioQuestionLib.encodeText('single-select', question, outcomeNames, category)

    const timeoutResolution = REALITIO_TIMEOUT || getRealitioTimeout(networkId)

    const args = [SINGLE_SELECT_TEMPLATE_ID, questionText, arbitratorAddress, timeoutResolution, openingTimestamp, 0]

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
    const network = await this.provider.getNetwork()
    const networkId = network.chainId

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: getEarliestBlockToCheck(networkId),
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

    const { arbitrator, opening_ts: openingTs, question } = event.values
    const templateId = event.values.template_id.toNumber()

    const isNuancedBinary = templateId === 5 || templateId === 6

    const nuancedBinaryTemplate = JSON.stringify({
      title: '%s',
      type: 'single-select',
      outcomes: ['No', 'Mostly No', 'Undecided', 'Mostly Yes', 'Yes'],
      category: '%s',
      lang: '%s',
    })

    const templates = ['bool', 'uint', 'single-select', 'multiple-select', 'datetime']

    const templateType = templates[templateId]
    const template = isNuancedBinary ? nuancedBinaryTemplate : RealitioTemplateLib.defaultTemplateForType(templateType)
    const questionLog: QuestionLog = RealitioQuestionLib.populatedJSONForTemplate(template, question)

    const { category, title } = questionLog

    const outcomes = isNuancedBinary || !questionLog.outcomes ? ['No', 'Yes'] : questionLog.outcomes

    return {
      id: questionId,
      title: title === 'undefined' ? '' : title,
      category: category === 'undefined' ? '' : category,
      resolution: new Date(openingTs * 1000),
      arbitratorAddress: arbitrator,
      outcomes: outcomes,
      templateId,
      raw: question,
      isPendingArbitration: question.isPendingArbitration,
      arbitrationOccurred: question.arbitrationOccurred,
      currentAnswerTimestamp: question.currentAnswerTimestamp,
    }
  }

  isFinalized = async (questionId: string): Promise<boolean> => {
    try {
      const isFinalized = await this.contract.isFinalized(questionId)
      return isFinalized
    } catch (err) {
      logger.error(`There was an error querying if the question with id '${questionId}' is finalized`, err.message)
      throw err
    }
  }

  getWinnerOutcome = async (questionId: string): Promise<number> => {
    const result: string = await this.getResultFor(questionId)
    const resultBN = bigNumberify(result)
    return +resultBN.toString()
  }

  getResultFor = async (questionId: string): Promise<string> => {
    try {
      const result: string = await this.contract.resultFor(questionId)
      return result
    } catch (err) {
      logger.error(`There was an error querying the result for question with id '${questionId}'`, err.message)
      throw err
    }
  }

  static encodeAskQuestion = (
    question: string,
    outcomes: Outcome[],
    category: string,
    arbitratorAddress: string,
    openingDateMoment: Moment,
    networkId: number,
  ): string => {
    const args = getQuestionArgs(question, outcomes, category, arbitratorAddress, openingDateMoment, networkId)

    const askQuestionInterface = new utils.Interface(realitioAbi)

    return askQuestionInterface.functions.askQuestion.encode(args)
  }

  static encodeAskScalarQuestion = (
    question: string,
    unit: string,
    category: string,
    arbitratorAddress: string,
    openingDateMoment: Moment,
    networkId: number,
  ): string => {
    const args = getScalarQuestionArgs(question, unit, category, arbitratorAddress, openingDateMoment, networkId)

    const askQuestionInterface = new utils.Interface(realitioAbi)

    return askQuestionInterface.functions.askQuestion.encode(args)
  }

  askQuestionConstant = async (
    question: string,
    outcomes: Outcome[],
    category: string,
    arbitratorAddress: string,
    openingDateMoment: Moment,
    networkId: number,
    signerAddress: string,
  ): Promise<string> => {
    const args = getQuestionArgs(question, outcomes, category, arbitratorAddress, openingDateMoment, networkId)

    const questionId = await this.constantContract.askQuestion(...args, {
      from: signerAddress,
    })

    return questionId
  }

  askScalarQuestionConstant = async (
    question: string,
    unit: string,
    category: string,
    arbitratorAddress: string,
    openingDateMoment: Moment,
    networkId: number,
    signerAddress: string,
  ): Promise<string> => {
    const args = getScalarQuestionArgs(question, unit, category, arbitratorAddress, openingDateMoment, networkId)

    const questionId = await this.constantContract.askQuestion(...args, {
      from: signerAddress,
    })

    return questionId
  }

  static encodeAnnounceConditionQuestionId = async (question: string, scalarLow: BigNumber, scalarHigh: BigNumber) => {
    const args = [question, scalarLow, scalarHigh]

    const announceConditionInterface = new utils.Interface(realitioScalarAdapterAbi)
    return announceConditionInterface.functions.announceConditionQuestionId.encode(args)
  }

  static encodeResolveCondition = async (
    questionId: string,
    question: string,
    scalarLow: BigNumber,
    scalarHigh: BigNumber,
  ) => {
    const args = [questionId, question, scalarLow, scalarHigh]

    const resolveConditionInterface = new utils.Interface(realitioScalarAdapterAbi)
    return resolveConditionInterface.functions.resolve.encode(args)
  }
}

export { RealitioService }
