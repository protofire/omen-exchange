import CPK from 'contract-proxy-kit'
import EthersAdapter from 'contract-proxy-kit/lib/cjs/eth-lib-adapters/EthersAdapter'
import { ethers } from 'ethers'
import { TransactionReceipt, Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import moment from 'moment'

import { getLogger } from '../util/logger'
import { getCPKAddresses, getContractAddress } from '../util/networks'
import { calcDistributionHint } from '../util/tools'
import { MarketData, Question, Token } from '../util/types'

import { ConditionalTokenService } from './conditional_token'
import { ERC20Service } from './erc20'
import { MarketMakerService } from './market_maker'
import { MarketMakerFactoryService } from './market_maker_factory'
import { OracleService } from './oracle'
import { RealitioService } from './realitio'

const logger = getLogger('Services::CPKService')

interface CPKBuyOutcomesParams {
  amount: BigNumber
  outcomeIndex: number
  marketMaker: MarketMakerService
}

interface CPKSellOutcomesParams {
  amount: BigNumber
  outcomeIndex: number
  marketMaker: MarketMakerService
  conditionalTokens: ConditionalTokenService
}

interface CPKCreateMarketParams {
  marketData: MarketData
  conditionalTokens: ConditionalTokenService
  realitio: RealitioService
  marketMakerFactory: MarketMakerFactoryService
}

interface CPKAddFundingParams {
  amount: BigNumber
  collateral: Token
  marketMaker: MarketMakerService
}

interface CPKRemoveFundingParams {
  amountToMerge: BigNumber
  collateralAddress: string
  conditionId: string
  conditionalTokens: ConditionalTokenService
  earnings: BigNumber
  marketMaker: MarketMakerService
  outcomesCount: number
  sharesToBurn: BigNumber
}

interface CPKRedeemParams {
  isConditionResolved: boolean
  question: Question
  numOutcomes: number
  earnedCollateral: BigNumber
  collateralToken: Token
  oracle: OracleService
  marketMaker: MarketMakerService
  conditionalTokens: ConditionalTokenService
}

class CPKService {
  cpk: any
  provider: Web3Provider

  constructor(cpk: any, provider: Web3Provider) {
    this.cpk = cpk
    this.provider = provider
  }

  static async create(provider: Web3Provider) {
    const signer = provider.getSigner()
    const network = await provider.getNetwork()
    const cpkAddresses = getCPKAddresses(network.chainId)
    const networks = cpkAddresses
      ? {
          [network.chainId]: cpkAddresses,
        }
      : {}
    const cpk = await CPK.create({
      ethLibAdapter: new EthersAdapter({
        ethers,
        signer,
      }),
      networks,
    })
    return new CPKService(cpk, provider)
  }

  get address(): string {
    return this.cpk.address
  }

  buyOutcomes = async ({ amount, marketMaker, outcomeIndex }: CPKBuyOutcomesParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      const collateralAddress = await marketMaker.getCollateralToken()
      const marketMakerAddress = marketMaker.address

      const collateralService = new ERC20Service(this.provider, account, collateralAddress)

      logger.log(`CPK address: ${this.cpk.address}`)

      const outcomeTokensToBuy = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      logger.log(`Min outcome tokens to buy: ${outcomeTokensToBuy}`)

      const transactions = [
        // Step 2: Transfer the amount of collateral being spent from the user to the CPK
        {
          to: collateralAddress,
          data: ERC20Service.encodeTransferFrom(account, this.cpk.address, amount),
        },
        // Step 3: Buy outcome tokens with the CPK
        {
          to: marketMakerAddress,
          data: MarketMakerService.encodeBuy(amount, outcomeIndex, outcomeTokensToBuy),
        },
      ]

      // Check  if the allowance of the CPK to the market maker is enough.
      const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
        this.cpk.address,
        marketMakerAddress,
        amount,
      )

      if (!hasCPKEnoughAlowance) {
        // Step 1:  Approve unlimited amount to be transferred to the market maker)
        transactions.unshift({
          to: collateralAddress,
          data: ERC20Service.encodeApproveUnlimited(marketMakerAddress),
        })
      }

      const txObject = await this.cpk.execTransactions(transactions)

      logger.log(`Transaction hash: ${txObject.hash}`)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error buying '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }

  createMarket = async ({
    conditionalTokens,
    marketData,
    marketMakerFactory,
    realitio,
  }: CPKCreateMarketParams): Promise<string> => {
    try {
      const { arbitrator, category, collateral, loadedQuestionId, outcomes, question, resolution, spread } = marketData

      if (!resolution) {
        throw new Error('Resolution time was not specified')
      }

      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      const network = await this.provider.getNetwork()
      const networkId = network.chainId

      const conditionalTokensAddress = conditionalTokens.address
      const realitioAddress = realitio.address

      const openingDateMoment = moment(resolution)

      const transactions = []

      let questionId: string
      if (loadedQuestionId) {
        questionId = loadedQuestionId
      } else {
        // Step 1: Create question in realitio
        transactions.push({
          to: realitioAddress,
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
          this.cpk.address,
        )
      }
      logger.log(`QuestionID ${questionId}`)

      const oracleAddress = getContractAddress(networkId, 'oracle')
      const conditionId = conditionalTokens.getConditionId(questionId, oracleAddress, outcomes.length)

      let conditionExists = false
      if (loadedQuestionId) {
        conditionExists = await conditionalTokens.doesConditionExist(conditionId)
      }

      if (!conditionExists) {
        // Step 2: Prepare condition
        logger.log(`Adding prepareCondition transaction`)

        transactions.push({
          to: conditionalTokensAddress,
          data: ConditionalTokenService.encodePrepareCondition(questionId, oracleAddress, outcomes.length),
        })
      }

      logger.log(`ConditionID: ${conditionId}`)

      // Step 3: Approve collateral for factory
      transactions.push({
        to: collateral.address,
        data: ERC20Service.encodeApproveUnlimited(marketMakerFactory.address),
      })

      // Step 4: Transfer funding from user
      transactions.push({
        to: collateral.address,
        data: ERC20Service.encodeTransferFrom(account, this.cpk.address, marketData.funding),
      })

      // Step 5: Create market maker
      const saltNonce = Math.round(Math.random() * 1000000)
      const predictedMarketMakerAddress = await marketMakerFactory.predictMarketMakerAddress(
        saltNonce,
        conditionalTokens.address,
        collateral.address,
        conditionId,
        this.cpk.address,
      )
      logger.log(`Predicted market maker address: ${predictedMarketMakerAddress}`)
      const distributionHint = calcDistributionHint(marketData.outcomes.map(o => o.probability))
      transactions.push({
        to: marketMakerFactory.address,
        data: MarketMakerFactoryService.encodeCreateMarketMaker(
          saltNonce,
          conditionalTokens.address,
          collateral.address,
          conditionId,
          spread,
          marketData.funding,
          distributionHint,
        ),
      })

      const txObject = await this.cpk.execTransactions(transactions)
      logger.log(`Transaction hash: ${txObject.hash}`)

      await this.provider.waitForTransaction(txObject.hash)
      return predictedMarketMakerAddress
    } catch (err) {
      logger.error(`There was an error creating the market maker`, err.message)
      throw err
    }
  }

  sellOutcomes = async ({
    amount,
    conditionalTokens,
    marketMaker,
    outcomeIndex,
  }: CPKSellOutcomesParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      const outcomeTokensToSell = await marketMaker.calcSellAmount(amount, outcomeIndex)
      const collateralAddress = await marketMaker.getCollateralToken()

      const transactions = []
      const isAlreadyApprovedForMarketMaker = await conditionalTokens.isApprovedForAll(
        this.cpk.address,
        marketMaker.address,
      )

      if (!isAlreadyApprovedForMarketMaker) {
        transactions.push({
          to: conditionalTokens.address,
          data: ConditionalTokenService.encodeSetApprovalForAll(marketMaker.address, true),
        })
      }

      transactions.push(
        {
          to: marketMaker.address,
          data: MarketMakerService.encodeSell(amount, outcomeIndex, outcomeTokensToSell),
        },
        {
          to: collateralAddress,
          data: ERC20Service.encodeTransfer(account, amount),
        },
      )

      const txObject = await this.cpk.execTransactions(transactions)

      logger.log(`Transaction hash: ${txObject.hash}`)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error selling '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }

  addFunding = async ({ amount, collateral, marketMaker }: CPKAddFundingParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      // Check  if the allowance of the CPK to the market maker is enough.
      const collateralService = new ERC20Service(this.provider, account, collateral.address)

      const transactions = []
      const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
        this.cpk.address,
        marketMaker.address,
        amount,
      )

      if (!hasCPKEnoughAlowance) {
        // Step 1:  Approve unlimited amount to be transferred to the market maker
        transactions.push({
          to: collateral.address,
          data: ERC20Service.encodeApproveUnlimited(marketMaker.address),
        })
      }

      transactions.push(
        {
          to: collateral.address,
          data: ERC20Service.encodeTransferFrom(account, this.cpk.address, amount),
        },
        {
          to: marketMaker.address,
          data: MarketMakerService.encodeAddFunding(amount),
        },
      )

      const txObject = await this.cpk.execTransactions(transactions)

      logger.log(`Transaction hash: ${txObject.hash}`)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error adding an amount of '${amount.toString()}' for funding`, err.message)
      throw err
    }
  }

  removeFunding = async ({
    amountToMerge,
    collateralAddress,
    conditionId,
    conditionalTokens,
    earnings,
    marketMaker,
    outcomesCount,
    sharesToBurn,
  }: CPKRemoveFundingParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      const removeFundingTx = {
        to: marketMaker.address,
        data: MarketMakerService.encodeRemoveFunding(sharesToBurn),
      }

      const mergePositionsTx = {
        to: conditionalTokens.address,
        data: ConditionalTokenService.encodeMergePositions(
          collateralAddress,
          conditionId,
          outcomesCount,
          amountToMerge,
        ),
      }

      // transfer to the user the merged collateral plus the earned fees
      const transferCollateralTx = {
        to: collateralAddress,
        data: ERC20Service.encodeTransfer(account, amountToMerge.add(earnings)),
      }

      const transactions = [removeFundingTx, mergePositionsTx, transferCollateralTx]

      const txObject = await this.cpk.execTransactions(transactions)

      logger.log(`Transaction hash: ${txObject.hash}`)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error removing amount '${sharesToBurn.toString()}' for funding`, err.message)
      throw err
    }
  }

  redeemPositions = async ({
    collateralToken,
    conditionalTokens,
    earnedCollateral,
    isConditionResolved,
    marketMaker,
    numOutcomes,
    oracle,
    question,
  }: CPKRedeemParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      const transactions = []
      if (!isConditionResolved) {
        transactions.push({
          to: oracle.address,
          data: OracleService.encodeResolveCondition(question.id, question.templateId, question.raw, numOutcomes),
        })
      }

      const conditionId = await marketMaker.getConditionId()

      transactions.push({
        to: conditionalTokens.address,
        data: ConditionalTokenService.encodeRedeemPositions(collateralToken.address, conditionId, numOutcomes),
      })

      if (earnedCollateral) {
        transactions.push({
          to: collateralToken.address,
          data: ERC20Service.encodeTransfer(account, earnedCollateral),
        })
      }

      const txObject = await this.cpk.execTransactions(transactions)

      logger.log(`Transaction hash: ${txObject.hash}`)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`Error trying to resolve condition or redeem for question id '${question.id}'`, err.message)
      throw err
    }
  }
}

export { CPKService }
