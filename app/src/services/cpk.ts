import { ethers, Wallet } from 'ethers'
import CPK from 'contract-proxy-kit'
import moment from 'moment'

import { getLogger } from '../util/logger'
import { ConditionalTokenService, ERC20Service, MarketMakerService, RealitioService } from './index'
import { BigNumber } from 'ethers/utils'
import { MarketData } from '../util/types'
import { getContractAddress } from '../util/networks'
import { calcDistributionHint } from '../util/tools'
import { MarketMakerFactoryService } from './market_maker_factory'
import { TransactionReceipt } from 'ethers/providers'
import { Token } from '../util/types'

const logger = getLogger('Services::CPKService')

interface CPKBuyOutcomesParams {
  cost: BigNumber
  amount: BigNumber
  outcomeIndex: number
  marketMaker: MarketMakerService
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

class CPKService {
  cpk: any
  provider: any

  constructor(cpk: any, provider: any) {
    this.cpk = cpk
    this.provider = provider
  }

  static async create(provider: any) {
    const signer: Wallet = provider.getSigner()
    const cpk = await CPK.create({ ethers, signer })
    return new CPKService(cpk, provider)
  }

  get address(): string {
    return this.cpk.address
  }

  buyOutcomes = async ({
    cost,
    amount,
    outcomeIndex,
    marketMaker,
  }: CPKBuyOutcomesParams): Promise<TransactionReceipt> => {
    try {
      const signer: Wallet = this.provider.getSigner()
      const account = await signer.getAddress()

      const collateralAddress = await marketMaker.getCollateralToken()
      const marketMakerAddress = marketMaker.address

      const collateralService = new ERC20Service(this.provider, account, collateralAddress)

      logger.log(`CPK address: ${this.cpk.address}`)

      const outcomeTokensToBuy = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      logger.log(`Min outcome tokens to buy: ${outcomeTokensToBuy}`)

      const transactions = [
        // Step 2: Transfer an amount (cost) from the user to the CPK
        {
          operation: CPK.CALL,
          to: collateralAddress,
          value: 0,
          data: ERC20Service.encodeTransferFrom(account, this.cpk.address, cost),
        },
        // Step 3: Buy outcome tokens with the CPK
        {
          operation: CPK.CALL,
          to: marketMakerAddress,
          value: 0,
          data: MarketMakerService.encodeBuy(amount, outcomeIndex, outcomeTokensToBuy),
        },
      ]

      // Check  if the allowance of the CPK to the market maker is enough.
      const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
        this.cpk.address,
        marketMakerAddress,
        cost,
      )

      if (!hasCPKEnoughAlowance) {
        // Step 1:  Approve unlimited amount to be transferred to the market maker)
        transactions.unshift({
          operation: CPK.CALL,
          to: collateralAddress,
          value: 0,
          data: ERC20Service.encodeApproveUnlimited(marketMakerAddress),
        })
      }

      const txObject = await this.cpk.execTransactions(transactions, { gasLimit: 1000000 })

      logger.log(`Transaction hash: ${txObject.hash}`)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error buying '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }

  createMarket = async ({
    marketData,
    conditionalTokens,
    realitio,
    marketMakerFactory,
  }: CPKCreateMarketParams): Promise<string> => {
    try {
      const {
        collateral,
        arbitrator,
        question,
        resolution,
        outcomes,
        category,
        loadedQuestionId,
      } = marketData

      if (!resolution) {
        throw new Error('Resolution time was not specified')
      }

      const signer: Wallet = this.provider.getSigner()
      const account = await signer.getAddress()

      const network = await this.provider.ready
      const networkId = network.chainId

      const conditionalTokensAddress = conditionalTokens.address
      const realitioAddress = realitio.address

      const openingDateMoment = moment(resolution)

      const transactions = []

      // Question interaction
      let questionId: string
      if (loadedQuestionId) {
        questionId = loadedQuestionId
      } else {
        // Step 1: Create question in realitio
        transactions.push({
          operation: CPK.CALL,
          to: realitioAddress,
          value: 0,
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

      // Step 2: Prepare condition
      const oracleAddress = getContractAddress(networkId, 'oracle')
      transactions.push({
        operation: CPK.CALL,
        to: conditionalTokensAddress,
        value: 0,
        data: ConditionalTokenService.encodePrepareCondition(
          questionId,
          oracleAddress,
          outcomes.length,
        ),
      })

      const conditionId = conditionalTokens.getConditionId(
        questionId,
        oracleAddress,
        outcomes.length,
      )
      logger.log(`ConditionID: ${conditionId}`)

      // Step 3: Approve collateral for factory
      transactions.push({
        operation: CPK.CALL,
        to: collateral.address,
        value: 0,
        data: ERC20Service.encodeApproveUnlimited(marketMakerFactory.address),
      })

      // Step 4: Transfer funding from user
      transactions.push({
        operation: CPK.CALL,
        to: collateral.address,
        value: 0,
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
        operation: CPK.CALL,
        to: marketMakerFactory.address,
        value: 0,
        data: MarketMakerFactoryService.encodeCreateMarketMaker(
          saltNonce,
          conditionalTokens.address,
          collateral.address,
          conditionId,
          marketData.funding,
          distributionHint,
        ),
      })

      const txObject = await this.cpk.execTransactions(transactions, { gasLimit: 2000000 })
      logger.log(`Transaction hash: ${txObject.hash}`)

      await this.provider.waitForTransaction(txObject.hash)
      return predictedMarketMakerAddress
    } catch (err) {
      logger.error(`There was an error creating the market maker`, err.message)
      throw err
    }
  }

  addFunding = async ({
    amount,
    collateral,
    marketMaker,
  }: CPKAddFundingParams): Promise<TransactionReceipt> => {
    try {
      const signer: Wallet = this.provider.getSigner()
      const account = await signer.getAddress()

      const transactions = [
        {
          operation: CPK.CALL,
          to: collateral.address,
          value: 0,
          data: ERC20Service.encodeTransferFrom(account, this.cpk.address, amount),
        },
        {
          operation: CPK.CALL,
          to: collateral.address,
          value: 0,
          data: ERC20Service.encodeApproveUnlimited(marketMaker.address),
        },
        {
          operation: CPK.CALL,
          to: marketMaker.address,
          value: 0,
          data: MarketMakerService.encodeAddFunding(amount),
        },
      ]

      const txObject = await this.cpk.execTransactions(transactions, { gasLimit: 2000000 })

      logger.log(`Transaction hash: ${txObject.hash}`)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(
        `There was an error adding an amount of '${amount.toString()}' for funding`,
        err.message,
      )
      throw err
    }
  }
}

export { CPKService }
