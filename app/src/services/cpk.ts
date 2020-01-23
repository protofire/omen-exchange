import { ethers, Wallet } from 'ethers'
import CPK from 'contract-proxy-kit'
import moment from 'moment'

import { getLogger } from '../util/logger'
import { ConditionalTokenService, ERC20Service, MarketMakerService, RealitioService } from './index'
import { BigNumber } from 'ethers/utils'
import { MarketData, Token } from '../util/types'
import { ConnectedWeb3Context } from '../hooks/connectedWeb3'
import { getContractAddress } from '../util/networks'
import { MarketMakerFactoryService } from './market_maker_factory'
import { TransactionReceipt } from 'ethers/providers'

const logger = getLogger('Services::CPKService')

interface CPKBuyOutcomesParams {
  provider: any
  cost: BigNumber
  amount: BigNumber
  outcomeIndex: number
  marketMaker: MarketMakerService
}

interface CPKCreateMarketParams {
  context: ConnectedWeb3Context
  marketData: MarketData
  conditionalTokens: ConditionalTokenService
  realitio: RealitioService
  marketMakerFactory: MarketMakerFactoryService
}

interface CPKFundMarketParams {
  context: ConnectedWeb3Context
  funding: BigNumber
  collateral: Token
  marketMakerAddress: string
  outcomes: BigNumber[]
}

class CPKService {
  static getCPK = async (provider: any) => {
    const signer: Wallet = provider.getSigner()

    const cpk = await CPK.create({ ethers, signer })
    return cpk
  }

  static buyOutcomes = async ({
    provider,
    cost,
    amount,
    outcomeIndex,
    marketMaker,
  }: CPKBuyOutcomesParams): Promise<TransactionReceipt> => {
    try {
      const signer: Wallet = provider.getSigner()
      const account = await signer.getAddress()

      const collateralAddress = await marketMaker.getCollateralToken()
      const marketMakerAddress = marketMaker.address

      const cpk = await CPK.getCPK(provider)

      const collateralService = new ERC20Service(provider, account, collateralAddress)

      logger.log(`CPK address: ${cpk.address}`)

      const outcomeTokensToBuy = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      logger.log(`Min outcome tokens to buy: ${outcomeTokensToBuy}`)

      const transactions = [
        // Step 2: Transfer an amount (cost) from the user to the CPK
        {
          operation: CPK.CALL,
          to: collateralAddress,
          value: 0,
          data: ERC20Service.encodeTransferFrom(account, cpk.address, cost),
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
        cpk.address,
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

      const txObject = await cpk.execTransactions(transactions, { gasLimit: 1000000 })

      logger.log(`Transaction hash: ${txObject.hash}`)
      return provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error buying '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }

  static createMarket = async ({
    context,
    marketData,
    conditionalTokens,
    realitio,
    marketMakerFactory,
  }: CPKCreateMarketParams): Promise<string> => {
    try {
      const { library: provider, networkId, account } = context
      if (!account) {
        throw new Error('You must be connected to your wallet.')
      }

      const signer = provider.getSigner()

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

      const cpk = await CPK.create({ ethers, signer })
      const cpkAddress = cpk.address
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
          cpkAddress,
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

      // Step 3: Create market maker
      const saltNonce = Math.round(Math.random() * 1000000)
      const predictedMarketMakerAddress = await marketMakerFactory.predictMarketMakerAddress(
        saltNonce,
        conditionalTokens.address,
        collateral.address,
        conditionId,
        cpkAddress,
      )
      logger.log(`Predicted market maker address: ${predictedMarketMakerAddress}`)

      transactions.push({
        operation: CPK.CALL,
        to: marketMakerFactory.address,
        value: 0,
        data: MarketMakerFactoryService.encodeCreateMarketMaker(
          saltNonce,
          conditionalTokens.address,
          collateral.address,
          conditionId,
        ),
      })

      const txObject = await cpk.execTransactions(transactions, { gasLimit: 1000000 })
      logger.log(`Transaction hash: ${txObject.hash}`)

      await provider.waitForTransaction(txObject.hash)
      return predictedMarketMakerAddress
    } catch (err) {
      logger.error(`There was an error creating the market maker`, err.message)
      throw err
    }
  }

  static addFundsToTheMarket = async ({
    context,
    collateral,
    funding,
    marketMakerAddress,
    outcomes,
  }: CPKFundMarketParams): Promise<TransactionReceipt> => {
    try {
      const { library: provider, account } = context
      if (!account) {
        throw new Error('You must be connected to your wallet.')
      }

      const signer = provider.getSigner()

      const cpk = await CPK.create({ ethers, signer })
      const cpkAddress = cpk.address

      // Step 1: Approve collateral to the proxy contract
      const collateralService = new ERC20Service(provider, account, collateral.address)
      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
        account,
        cpkAddress,
        funding,
      )

      if (!hasEnoughAlowance) {
        await collateralService.approveUnlimited(cpkAddress)
      }

      const transactions = [
        // Step 2: Move the collateral to the CPK
        {
          operation: CPK.CALL,
          to: collateral.address,
          value: 0,
          data: ERC20Service.encodeTransferFrom(account, cpkAddress, funding),
        },
        // Step 3: Add funding
        {
          operation: CPK.CALL,
          to: marketMakerAddress,
          value: 0,
          data: MarketMakerService.encodeAddFunding(funding, outcomes),
        },
      ]

      // Check  if the allowance of the CPK to the market maker is enough.
      const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
        cpkAddress,
        marketMakerAddress,
        funding,
      )

      if (!hasCPKEnoughAlowance) {
        // Step 4:  Approve unlimited funding to be transferred to the market maker)
        transactions.unshift({
          operation: CPK.CALL,
          to: collateral.address,
          value: 0,
          data: ERC20Service.encodeApproveUnlimited(marketMakerAddress),
        })
      }

      const txObject = await cpk.execTransactions(transactions, { gasLimit: 1000000 })
      logger.log(`Transaction hash: ${txObject.hash}`)

      return provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error adding funding to the market maker`, err.message)
      throw err
    }
  }
}

export { CPKService }
