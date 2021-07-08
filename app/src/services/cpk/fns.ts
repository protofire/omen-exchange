import { Zero } from 'ethers/constants'
import { BigNumber, defaultAbiCoder, keccak256 } from 'ethers/utils'
import moment from 'moment'

import { Transaction } from '../../util/cpk'
import { getLogger } from '../../util/logger'
import { getContractAddress, getWrapToken, pseudoNativeAssetAddress } from '../../util/networks'
import { calcDistributionHint, clampBigNumber } from '../../util/tools'
import { MarketData, Token, TransactionStep } from '../../util/types'
import { ConditionalTokenService } from '../conditional_token'
import { ERC20Service } from '../erc20'
import { MarketMakerService } from '../market_maker'
import { MarketMakerFactoryService } from '../market_maker_factory'
import { RealitioService } from '../realitio'

import { CPKService, TxOptions } from './cpk'

const logger = getLogger('Services::CPKService')

// @ts-expect-error ignore
export const pipe = (...fns) => input => fns.reduce((chain, func) => chain.then(func), Promise.resolve(input))

const getMarketCollateral = (token: Token, networkId: number) => {
  if (token.address.toLowerCase() === pseudoNativeAssetAddress.toLowerCase()) {
    return getWrapToken(networkId)
  }
  return token
}

/**
 * Setup the basic information each pipe needs, e.g. networkId, account, empty transaction array
 */

interface SetupParams {
  service: CPKService
}

export const setup = async (params: SetupParams) => {
  const { service } = params

  // account
  const signer = service.provider.getSigner()
  const account = await signer.getAddress()

  // network id
  const network = await service.provider.getNetwork()
  const networkId = network.chainId

  // empty tx array
  const transactions: Transaction[] = []

  // tx options
  const txOptions: TxOptions = {}

  return { ...params, account, networkId, transactions, txOptions }
}

interface ExecParams {
  service: CPKService
  transactions: Transaction[]
  txOptions: TxOptions
  setTxHash: (arg0: string) => void
  setTxState: (step: TransactionStep) => void
}

export const exec = async (params: ExecParams) => {
  const { service, setTxHash, setTxState, transactions, txOptions } = params
  if (service.cpk.relay) {
    const { address, fee } = await service.relayService.getInfo()
    transactions.push({
      to: address,
      value: fee,
    })
  }

  const txObject = await service.cpk.execTransactions(transactions, txOptions)
  setTxState && setTxState(TransactionStep.transactionSubmitted)
  setTxHash && setTxHash(txObject.hash)
  const transaction = await service.waitForTransaction(txObject)
  setTxState && setTxState(TransactionStep.transactionConfirmed)
  return { ...params, transaction }
}

/**
 * Subtract the relay fee from the input amount if required
 */

interface FeeParams {
  service: CPKService
  amount: BigNumber
}

export const fee = async (params: FeeParams) => {
  const { service } = params
  const amount = await service.subRelayFee(params.amount)
  return { ...params, amount }
}

/**
 * Wrap the input amount if required
 */

interface WrapParams {
  amount: BigNumber
  collateral: Token
  networkId: number
  service: CPKService
  transactions: Transaction[]
  txOptions: TxOptions
}

export const wrap = async (params: WrapParams) => {
  const { amount, collateral, networkId, service, transactions, txOptions } = params
  if (collateral.address.toLowerCase() === pseudoNativeAssetAddress.toLowerCase()) {
    if (!service.isSafeApp) {
      txOptions.value = amount
    }
    transactions.push({
      to: getWrapToken(networkId).address,
      value: amount.toString(),
    })
  }

  return params
}

/**
 * Make an unlimited approval to the market maker for the collateral token if required
 */

interface ApproveParams {
  collateral: Token
  marketMaker?: MarketMakerService
  marketMakerFactory?: MarketMakerFactoryService
  networkId: number
  transactions: Transaction[]
}

export const approve = async (params: ApproveParams) => {
  const { collateral, marketMaker, marketMakerFactory, networkId, transactions } = params
  const spender = marketMaker?.address || marketMakerFactory?.address
  if (spender) {
    transactions.push({
      to: getMarketCollateral(collateral, networkId).address,
      data: ERC20Service.encodeApproveUnlimited(spender),
    })
  }
  return params
}

/**
 * Transfer the collateral amount to the CPK if required
 */

interface TransferParams {
  account: string
  amount: BigNumber
  collateral: Token
  service: CPKService
  transactions: Transaction[]
}

export const transfer = async (params: TransferParams) => {
  const { account, amount, collateral, service, transactions } = params
  if (!service.isSafeApp && collateral.address !== pseudoNativeAssetAddress) {
    // Step 2: Transfer the amount of collateral being spent from the user to the CPK
    transactions.push({
      to: collateral.address,
      data: ERC20Service.encodeTransferFrom(account, service.cpk.address, amount),
    })
  }
  return params
}

/**
 * Buy from the market maker with the input amount
 */

interface BuyParams {
  account: string
  amount: BigNumber
  collateral: Token
  marketMaker: MarketMakerService
  service: CPKService
  transactions: Transaction[]
  outcomeIndex: number
}

export const buy = async (params: BuyParams) => {
  const { amount, marketMaker, outcomeIndex, transactions } = params
  const outcomeTokensToBuy = await marketMaker.calcBuyAmount(amount, outcomeIndex)

  transactions.push({
    to: marketMaker.address,
    data: MarketMakerService.encodeBuy(amount, outcomeIndex, outcomeTokensToBuy),
  })

  return params
}

/**
 * Create question
 */

interface CreateQuestionParams {
  marketData: MarketData
  realitio: RealitioService
  transactions: Transaction[]
  networkId: number
  service: CPKService
}

export const createQuestion = async (params: CreateQuestionParams) => {
  const { marketData, networkId, realitio, service, transactions } = params
  const { arbitrator, category, loadedQuestionId, lowerBound, outcomes, question, resolution, unit } = marketData

  if (!resolution) {
    throw new Error('Resolution time was not specified')
  }

  const isScalar = lowerBound ? true : false
  const openingDateMoment = moment(resolution)

  let questionId: string
  if (loadedQuestionId) {
    questionId = loadedQuestionId
  } else {
    if (isScalar) {
      // Create question in realitio without bounds
      transactions.push({
        to: realitio.address,
        data: RealitioService.encodeAskScalarQuestion(
          question,
          unit,
          category,
          arbitrator.address,
          openingDateMoment,
          networkId,
        ),
      })
      questionId = await realitio.askScalarQuestionConstant(
        question,
        unit,
        category,
        arbitrator.address,
        openingDateMoment,
        networkId,
        service.cpk.address,
      )
    } else {
      // Create question in realitio
      transactions.push({
        to: realitio.address,
        data: RealitioService.encodeAskQuestion(
          question,
          outcomes,
          category,
          arbitrator.address,
          openingDateMoment,
          networkId,
        ),
      })
      questionId = await realitio.askQuestionConstant(
        question,
        outcomes,
        category,
        arbitrator.address,
        openingDateMoment,
        networkId,
        service.cpk.address,
      )
    }
  }

  logger.log(`QuestionID ${questionId}`)

  return { ...params, isScalar, questionId }
}

/**
 * Announce the questionId and its bounds to the RealitioScalarAdapter
 */

interface AnnounceConditionIdParams {
  marketData: MarketData
  realitio: RealitioService
  transactions: Transaction[]
  service: CPKService
  questionId: string
}

export const announceCondition = async (params: AnnounceConditionIdParams) => {
  const { marketData, questionId, realitio, transactions } = params
  const { lowerBound, upperBound } = marketData
  const conditionQuestionId = keccak256(
    defaultAbiCoder.encode(['bytes32', 'uint256', 'uint256'], [questionId, lowerBound, upperBound]),
  )
  if (lowerBound && upperBound) {
    logger.log(`Reality.eth QuestionID ${questionId}`)
    logger.log(`Conditional Tokens QuestionID ${conditionQuestionId}`)

    transactions.push({
      to: realitio.scalarContract.address,
      data: RealitioService.encodeAnnounceConditionQuestionId(questionId, lowerBound, upperBound),
    })
  }

  return { ...params, conditionQuestionId }
}

/**
 * Prepare condition
 */

interface PrepareConditionParams {
  conditionQuestionId: Maybe<string>
  conditionalTokens: ConditionalTokenService
  marketData: MarketData
  realitio: RealitioService
  transactions: Transaction[]
  networkId: number
  service: CPKService
  questionId: string
}

export const prepareCondition = async (params: PrepareConditionParams) => {
  const { conditionQuestionId, conditionalTokens, marketData, networkId, questionId, transactions } = params
  const { outcomes } = marketData

  const oracleAddress = getContractAddress(networkId, conditionQuestionId ? 'realitioScalarAdapter' : 'oracle')
  const outcomeSlotCount = conditionQuestionId ? 2 : outcomes.length
  const selectedQuestionId = conditionQuestionId || questionId
  const conditionId = conditionalTokens.getConditionId(selectedQuestionId, oracleAddress, outcomeSlotCount)

  const conditionExists = await conditionalTokens.doesConditionExist(conditionId)
  if (!conditionExists) {
    transactions.push({
      to: conditionalTokens.address,
      data: ConditionalTokenService.encodePrepareCondition(selectedQuestionId, oracleAddress, outcomeSlotCount),
    })
  }

  logger.log(`ConditionID: ${conditionId}`)

  return { ...params, conditionId }
}

/**
 * Create market maker
 */

interface CreateMarketParams {
  amount: BigNumber
  conditionId: string
  conditionalTokens: ConditionalTokenService
  collateral: Token
  marketData: MarketData
  marketMakerFactory: MarketMakerFactoryService
  realitio: RealitioService
  transactions: Transaction[]
  networkId: number
  service: CPKService
  isScalar: boolean
}

export const createMarket = async (params: CreateMarketParams) => {
  const {
    amount,
    conditionId,
    conditionalTokens,
    isScalar,
    marketData,
    marketMakerFactory,
    networkId,
    service,
    transactions,
  } = params
  const { lowerBound, outcomes, spread, startingPoint, upperBound } = marketData

  if (isScalar) {
    if (!lowerBound) {
      throw new Error('Lower bound not specified')
    }

    if (!upperBound) {
      throw new Error('Upper bound not specified')
    }

    if (!startingPoint) {
      throw new Error('Starting expected value not specified')
    }

    if (lowerBound.gt(startingPoint) || startingPoint.gt(upperBound)) {
      throw new Error('Starting expected value should be between lowerBound and upperBound')
    }
  }

  // generate predicted marketMaker address
  const collateral = getMarketCollateral(params.collateral, networkId)
  const saltNonce = Math.round(Math.random() * 1000000)
  const predictedMarketMakerAddress = await marketMakerFactory.predictMarketMakerAddress(
    saltNonce,
    conditionalTokens.address,
    collateral.address,
    conditionId,
    service.cpk.address,
    spread,
  )
  logger.log(`Predicted market maker address: ${predictedMarketMakerAddress}`)

  // calculate distribution hint
  let distributionHint
  if (isScalar && upperBound && lowerBound && startingPoint) {
    const domainSize = upperBound.sub(lowerBound)
    const a = clampBigNumber(upperBound.sub(startingPoint), Zero, domainSize)
    const b = clampBigNumber(startingPoint.sub(lowerBound), Zero, domainSize)
    distributionHint = [b, a]
  } else {
    distributionHint = calcDistributionHint(outcomes.map(o => o.probability))
  }

  // create market tx
  transactions.push({
    to: marketMakerFactory.address,
    data: MarketMakerFactoryService.encodeCreateMarketMaker(
      saltNonce,
      conditionalTokens.address,
      collateral.address,
      conditionId,
      spread,
      amount,
      distributionHint,
    ),
  })

  return { ...params, predictedMarketMakerAddress }
}

/**
 * Wrangle market data to match common inputs
 */

interface WrangleMarketDataParams {
  marketData: MarketData
}

export const wrangleMarketData = async (params: WrangleMarketDataParams) => {
  const { marketData } = params
  return { ...params, amount: marketData.funding, collateral: marketData.collateral }
}
