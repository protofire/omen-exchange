import { txs } from '@gnosis.pm/safe-apps-sdk/dist/txs'
import { ethers } from 'ethers'
import { TransactionReceipt, Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import moment from 'moment'

import { createCPK } from '../util/cpk'
import { getLogger } from '../util/logger'
import {
  getContractAddress,
  getTargetSafeImplementation,
  getToken,
  getTokenFromAddress,
  getWrapToken,
  pseudoNativeAssetAddress,
} from '../util/networks'
import { calcDistributionHint, waitABit } from '../util/tools'
import { MarketData, Question, Token } from '../util/types'

import { CompoundService } from './compound_service'
import { ConditionalTokenService } from './conditional_token'
import { ERC20Service } from './erc20'
import { MarketMakerService } from './market_maker'
import { MarketMakerFactoryService } from './market_maker_factory'
import { OracleService } from './oracle'
import { OvmService } from './ovm'
import { RealitioService } from './realitio'

const logger = getLogger('Services::CPKService')

interface CPKBuyOutcomesParams {
  amount: BigNumber
  collateral: Token
  compoundService: CompoundService | null
  outcomeIndex: number
  useBaseToken: boolean
  marketMaker: MarketMakerService
}

interface CPKSellOutcomesParams {
  amount: BigNumber
  compoundService: CompoundService | null
  outcomeIndex: number
  marketMaker: MarketMakerService
  useBaseToken: boolean
  conditionalTokens: ConditionalTokenService
}

interface CPKCreateMarketParams {
  compoundService: CompoundService | null
  compoundTokenDetails: Token
  marketData: MarketData
  conditionalTokens: ConditionalTokenService
  realitio: RealitioService
  marketMakerFactory: MarketMakerFactoryService
  useCompoundReserve: boolean
}

interface CPKAddFundingParams {
  amount: BigNumber
  collateral: Token
  compoundService: CompoundService | null
  marketMaker: MarketMakerService
  useBaseToken: boolean
}

interface CPKRemoveFundingParams {
  amountToMerge: BigNumber
  collateralAddress: string
  compoundService: CompoundService | null
  conditionId: string
  conditionalTokens: ConditionalTokenService
  earnings: BigNumber
  marketMaker: MarketMakerService
  outcomesCount: number
  sharesToBurn: BigNumber
  useBaseToken: boolean
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

interface TransactionResult {
  hash?: string
  safeTxHash?: string
}

interface TxOptions {
  value?: BigNumber
  gas?: number
}

const proxyAbi = [
  'function masterCopy() external view returns (address)',
  'function changeMasterCopy(address _masterCopy) external',
  'function swapOwner(address prevOwner, address oldOwner, address newOwner) external',
  'function getOwners() public view returns (address[] memory)',
]

interface CPKRequestVerificationParams {
  params: string
  ovmAddress: string
  submissionDeposit: string
}

interface CreateMarketResult {
  transaction: TransactionReceipt
  marketMakerAddress: string
}

class CPKService {
  cpk: any
  provider: Web3Provider
  proxy: any

  constructor(cpk: any, provider: Web3Provider) {
    this.cpk = cpk
    this.provider = provider
    this.proxy = new ethers.Contract(cpk.address, proxyAbi, provider.getSigner())
  }

  static async create(provider: Web3Provider) {
    const cpk = await createCPK(provider)
    return new CPKService(cpk, provider)
  }

  get address(): string {
    return this.cpk.address
  }

  getTransactionHash = async (txObject: TransactionResult): Promise<string> => {
    if (txObject.hash) {
      return txObject.hash
    }

    if (txObject.safeTxHash) {
      let transactionHash
      // poll for safe tx data
      while (!transactionHash) {
        const safeTransaction = await txs.getBySafeTxHash(txObject.safeTxHash)
        if (safeTransaction.transactionHash) {
          transactionHash = safeTransaction.transactionHash
        }
        await waitABit()
      }
      return transactionHash
    }

    return ''
  }

  buyOutcomes = async ({
    amount,
    collateral,
    compoundService,
    marketMaker,
    outcomeIndex,
    useBaseToken = false,
  }: CPKBuyOutcomesParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()
      const network = await this.provider.getNetwork()
      const networkId = network.chainId

      const transactions = []

      const txOptions: TxOptions = {}

      let collateralAddress
      if (collateral.address === pseudoNativeAssetAddress) {
        // ultimately WETH will be the collateral if we fund with native ether
        collateralAddress = getWrapToken(networkId).address

        // we need to send the funding amount in native ether
        if (!this.cpk.isSafeApp()) {
          txOptions.value = amount
        }
        if (this.cpk.isSafeApp() || collateral.address === pseudoNativeAssetAddress) {
          txOptions.gas = 500000
        }
        // Step 0: Wrap ether
        transactions.push({
          to: collateralAddress,
          value: amount,
        })
      } else {
        collateralAddress = await marketMaker.getCollateralToken()
      }
      const marketMakerAddress = marketMaker.address
      const collateralService = new ERC20Service(this.provider, account, collateralAddress)
      let collateralSymbol = ''
      let userInputCollateralSymbol: KnownToken
      let userInputCollateral: Token = collateral
      logger.log(`CPK address: ${this.cpk.address}`)
      let minCollateralAmount = amount
      if (useBaseToken && compoundService != null) {
        collateralSymbol = collateral.symbol.toLowerCase()
        userInputCollateralSymbol = collateralSymbol.substring(1, collateralSymbol.length) as KnownToken
        userInputCollateral = getToken(networkId, userInputCollateralSymbol)
        minCollateralAmount = compoundService.calculateBaseToCTokenExchange(userInputCollateral, amount)
      }
      const outcomeTokensToBuy = await marketMaker.calcBuyAmount(minCollateralAmount, outcomeIndex)
      logger.log(`Min outcome tokens to buy: ${outcomeTokensToBuy}`)

      // Check  if the allowance of the CPK to the market maker is enough.
      const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
        this.cpk.address,
        marketMakerAddress,
        minCollateralAmount,
      )

      if (!hasCPKEnoughAlowance) {
        // Step 1:  Approve unlimited amount to be transferred to the market maker)
        transactions.push({
          to: collateralAddress,
          data: ERC20Service.encodeApproveUnlimited(marketMakerAddress),
        })
      }

      // Step 2: Transfer the amount of collateral being spent from the user to the CPK
      // If we are funding with native ether we can skip this step
      // If we are signed in as a safe we don't need to transfer
      if (!this.cpk.isSafeApp() && collateral.address !== pseudoNativeAssetAddress) {
        // Step 2: Transfer the amount of collateral being spent from the user to the CPK
        // If user chooses to spend base token then transfer base collateral
        if (useBaseToken) {
          transactions.push({
            to: userInputCollateral.address,
            data: ERC20Service.encodeTransferFrom(account, this.cpk.address, amount),
          })
        } else {
          transactions.push({
            to: collateralAddress,
            data: ERC20Service.encodeTransferFrom(account, this.cpk.address, amount),
          })
        }
      }
      if (useBaseToken) {
        // get base token
        const encodedMintFunction = CompoundService.encodeMintTokens(collateralSymbol, amount.toString())
        // Approve cToken for the cpk contract
        transactions.push({
          to: userInputCollateral.address,
          data: ERC20Service.encodeApproveUnlimited(collateral.address),
        })
        // Mint ctokens from the underlying token
        transactions.push({
          to: collateral.address,
          data: encodedMintFunction,
        })
      }
      // Step 3: Buy outcome tokens with the CPK
      transactions.push({
        to: marketMakerAddress,
        data: MarketMakerService.encodeBuy(minCollateralAmount, outcomeIndex, outcomeTokensToBuy),
      })

      const txObject = await this.cpk.execTransactions(transactions, txOptions)
      const txHash = await this.getTransactionHash(txObject)
      logger.log(`Transaction hash: ${txHash}`)
      return this.provider.waitForTransaction(txHash)
    } catch (err) {
      logger.error(`There was an error buying '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }

  createMarket = async ({
    compoundService,
    compoundTokenDetails,
    conditionalTokens,
    marketData,
    marketMakerFactory,
    realitio,
    useCompoundReserve,
  }: CPKCreateMarketParams): Promise<CreateMarketResult> => {
    try {
      const {
        arbitrator,
        category,
        loadedQuestionId,
        outcomes,
        question,
        resolution,
        spread,
        userInputCollateral,
      } = marketData

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
      const txOptions: TxOptions = {}

      if (this.cpk.isSafeApp() || marketData.collateral.address === pseudoNativeAssetAddress) {
        txOptions.gas = 1200000
      }
      let collateral
      if (marketData.collateral.address === pseudoNativeAssetAddress) {
        // ultimately WETH will be the collateral if we fund with native ether
        collateral = getWrapToken(networkId)

        // we need to send the funding amount in native ether
        if (!this.cpk.isSafeApp()) {
          txOptions.value = marketData.funding
        }

        // Step 0: Wrap ether
        transactions.push({
          to: collateral.address,
          value: marketData.funding,
        })
      } else {
        collateral = marketData.collateral
      }

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
      // If we are funding with native ether we can skip this step
      // If we are signed in as a safe we don't need to transfer
      if (!this.cpk.isSafeApp() && marketData.collateral.address !== pseudoNativeAssetAddress) {
        transactions.push({
          to: userInputCollateral.address,
          data: ERC20Service.encodeTransferFrom(account, this.cpk.address, marketData.funding),
        })
      }
      let marketPoolFunding = marketData.funding
      if (useCompoundReserve && compoundService) {
        marketPoolFunding = compoundService.calculateBaseToCTokenExchange(userInputCollateral, marketPoolFunding)
        const encodedMintFunction = CompoundService.encodeMintTokens(
          compoundTokenDetails.symbol,
          marketData.funding.toString(),
        )
        // Approve cToken for the cpk contract
        transactions.push({
          to: userInputCollateral.address,
          data: ERC20Service.encodeApproveUnlimited(collateral.address),
        })
        // Mint ctokens from the underlying token
        transactions.push({
          to: collateral.address,
          data: encodedMintFunction,
        })
      }

      // Step 5: Create market maker
      const saltNonce = Math.round(Math.random() * 1000000)
      const predictedMarketMakerAddress = await marketMakerFactory.predictMarketMakerAddress(
        saltNonce,
        conditionalTokens.address,
        collateral.address,
        conditionId,
        this.cpk.address,
        spread,
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
          marketPoolFunding,
          distributionHint,
        ),
      })

      const txObject = await this.cpk.execTransactions(transactions, txOptions)

      const txHash = await this.getTransactionHash(txObject)
      logger.log(`Transaction hash: ${txHash}`)

      const transaction = await this.provider.waitForTransaction(txObject.hash)
      return {
        transaction,
        marketMakerAddress: predictedMarketMakerAddress,
      }
    } catch (err) {
      logger.error(`There was an error creating the market maker`, err.message)
      throw err
    }
  }

  sellOutcomes = async ({
    amount,
    compoundService,
    conditionalTokens,
    marketMaker,
    outcomeIndex,
    useBaseToken,
  }: CPKSellOutcomesParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      const outcomeTokensToSell = await marketMaker.calcSellAmount(amount, outcomeIndex)
      const collateralAddress = await marketMaker.getCollateralToken()

      const transactions = []
      const txOptions: TxOptions = {}

      if (this.cpk.isSafeApp()) {
        txOptions.gas = 500000
      }

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

      transactions.push({
        to: marketMaker.address,
        data: MarketMakerService.encodeSell(amount, outcomeIndex, outcomeTokensToSell),
      })
      // If we are signed in as a safe we don't need to transfer
      if (!this.cpk.isSafeApp()) {
        if (useBaseToken && compoundService != null) {
          const network = await this.provider.getNetwork()
          const networkId = network.chainId
          const collateralToken = getTokenFromAddress(networkId, collateralAddress)
          const collateralSymbol = collateralToken.symbol.toLowerCase()
          const userInputCollateralSymbol = collateralSymbol.substring(1, collateralSymbol.length) as KnownToken
          const userInputCollateral = getToken(networkId, userInputCollateralSymbol)
          const minCollateralAmount = compoundService.calculateCTokenToBaseExchange(userInputCollateral, amount)
          // Convert cpk token to base token if user wants to redeem in base
          const encodedRedeemFunction = CompoundService.encodeRedeemTokens(collateralSymbol, amount.toString())
          // Approve cToken for the cpk contract
          transactions.push({
            to: userInputCollateral.address,
            data: ERC20Service.encodeApproveUnlimited(collateralToken.address),
          })
          // Mint ctokens from the underlying token
          transactions.push({
            to: collateralToken.address,
            data: encodedRedeemFunction,
          })
          // Transfer base token to the user
          transactions.push({
            to: userInputCollateral.address,
            data: ERC20Service.encodeTransfer(account, minCollateralAmount),
          })
        } else {
          // Step 4: Transfer funding to user
          transactions.push({
            to: collateralAddress,
            data: ERC20Service.encodeTransfer(account, amount),
          })
        }
      }

      const txObject = await this.cpk.execTransactions(transactions, txOptions)
      const txHash = await this.getTransactionHash(txObject)
      logger.log(`Transaction hash: ${txHash}`)
      return this.provider.waitForTransaction(txHash)
    } catch (err) {
      logger.error(`There was an error selling '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }

  addFunding = async ({
    amount,
    collateral,
    compoundService,
    marketMaker,
    useBaseToken,
  }: CPKAddFundingParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()

      const network = await this.provider.getNetwork()
      const networkId = network.chainId

      const transactions = []

      const txOptions: TxOptions = {}
      const collateralService = new ERC20Service(this.provider, account, collateral.address)
      let collateralSymbol = ''
      let userInputCollateralSymbol: KnownToken
      let userInputCollateral: Token = collateral

      if (this.cpk.isSafeApp() || collateral.address === pseudoNativeAssetAddress) {
        txOptions.gas = 500000
      }

      let collateralAddress
      if (collateral.address === pseudoNativeAssetAddress) {
        // ultimately WETH will be the collateral if we fund with native ether
        collateralAddress = getWrapToken(networkId).address

        // we need to send the funding amount in native ether
        if (!this.cpk.isSafeApp()) {
          txOptions.value = amount
        }

        // Step 0: Wrap ether
        transactions.push({
          to: collateralAddress,
          value: amount,
        })
      } else {
        collateralAddress = collateral.address
      }

      // Check  if the allowance of the CPK to the market maker is enough.
      const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
        this.cpk.address,
        marketMaker.address,
        amount,
      )

      if (!hasCPKEnoughAlowance) {
        // Step 1:  Approve unlimited amount to be transferred to the market maker
        transactions.push({
          to: collateralAddress,
          data: ERC20Service.encodeApproveUnlimited(marketMaker.address),
        })
      }
      let minCollateralAmount = amount
      if (useBaseToken && compoundService != null) {
        collateralSymbol = collateral.symbol.toLowerCase()
        userInputCollateralSymbol = collateralSymbol.substring(1, collateralSymbol.length) as KnownToken
        userInputCollateral = getToken(networkId, userInputCollateralSymbol)
        minCollateralAmount = compoundService.calculateBaseToCTokenExchange(userInputCollateral, amount)
      }
      // If we are signed in as a safe we don't need to transfer
      if (!this.cpk.isSafeApp() && collateral.address !== pseudoNativeAssetAddress) {
        // Step 4: Transfer funding from user
        if (useBaseToken) {
          // If use base token then transfer the base token amount from the user
          transactions.push({
            to: userInputCollateral.address,
            data: ERC20Service.encodeTransferFrom(account, this.cpk.address, amount),
          })
        } else {
          // If use collateral token then transfer the collateral token amount from the suer
          transactions.push({
            to: collateral.address,
            data: ERC20Service.encodeTransferFrom(account, this.cpk.address, minCollateralAmount),
          })
        }
      }
      if (useBaseToken) {
        // get base token
        const encodedMintFunction = CompoundService.encodeMintTokens(collateralSymbol, amount.toString())
        // Approve cToken for the cpk contract
        transactions.push({
          to: userInputCollateral.address,
          data: ERC20Service.encodeApproveUnlimited(collateral.address),
        })
        // Mint ctokens from the underlying token
        transactions.push({
          to: collateral.address,
          data: encodedMintFunction,
        })
      }

      // Step 3: Add funding to market
      transactions.push({
        to: marketMaker.address,
        data: MarketMakerService.encodeAddFunding(minCollateralAmount),
      })

      const txObject = await this.cpk.execTransactions(transactions, txOptions)
      const txHash = await this.getTransactionHash(txObject)
      logger.log(`Transaction hash: ${txHash}`)
      return this.provider.waitForTransaction(txHash)
    } catch (err) {
      logger.error(`There was an error adding an amount of '${amount.toString()}' for funding`, err.message)
      throw err
    }
  }

  removeFunding = async ({
    amountToMerge,
    collateralAddress,
    compoundService,
    conditionId,
    conditionalTokens,
    earnings,
    marketMaker,
    outcomesCount,
    sharesToBurn,
    useBaseToken,
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

      const transactions = [removeFundingTx, mergePositionsTx]

      const txOptions: TxOptions = {}

      if (this.cpk.isSafeApp()) {
        txOptions.gas = 500000
      }

      // If we are signed in as a safe we don't need to transfer
      if (!this.cpk.isSafeApp()) {
        const totalAmountEarned = amountToMerge.add(earnings)
        // transfer to the user the merged collateral plus the earned fees
        if (useBaseToken && compoundService != null) {
          const network = await this.provider.getNetwork()
          const networkId = network.chainId
          const collateralToken = getTokenFromAddress(networkId, collateralAddress)
          const collateralSymbol = collateralToken.symbol.toLowerCase()
          const userInputCollateralSymbol = collateralSymbol.substring(1, collateralSymbol.length) as KnownToken
          const userInputCollateral = getToken(networkId, userInputCollateralSymbol)
          const minCollateralAmount = compoundService.calculateCTokenToBaseExchange(
            userInputCollateral,
            totalAmountEarned,
          )
          // Convert cpk token to base token if user wants to redeem in base
          const encodedRedeemFunction = CompoundService.encodeRedeemTokens(
            collateralSymbol,
            totalAmountEarned.toString(),
          )
          // Approve cToken for the cpk contract
          transactions.push({
            to: userInputCollateral.address,
            data: ERC20Service.encodeApproveUnlimited(collateralToken.address),
          })
          // Mint ctokens from the underlying token
          transactions.push({
            to: collateralToken.address,
            data: encodedRedeemFunction,
          })
          // Transfer base token to the user
          transactions.push({
            to: userInputCollateral.address,
            data: ERC20Service.encodeTransfer(account, minCollateralAmount),
          })
        } else {
          transactions.push({
            to: collateralAddress,
            data: ERC20Service.encodeTransfer(account, totalAmountEarned),
          })
        }
      }

      const txObject = await this.cpk.execTransactions(transactions, txOptions)
      const txHash = await this.getTransactionHash(txObject)
      logger.log(`Transaction hash: ${txHash}`)
      return this.provider.waitForTransaction(txHash)
    } catch (err) {
      logger.error(`There was an error removing amount '${sharesToBurn.toString()}' for funding`, err.message)
      throw err
    }
  }

  requestVerification = async ({
    ovmAddress,
    params,
    submissionDeposit,
  }: CPKRequestVerificationParams): Promise<TransactionReceipt> => {
    try {
      const signer = this.provider.getSigner()
      const ovm = new OvmService()
      const contractInstance = await ovm.createOvmContractInstance(signer, ovmAddress)

      const { hash } = await ovm.generateTransaction(params, contractInstance, submissionDeposit)

      return this.provider.waitForTransaction(hash)
    } catch (err) {
      logger.error('Error while requesting market verification via Kleros!', err.message)
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
      const txOptions: TxOptions = {}

      if (this.cpk.isSafeApp()) {
        txOptions.gas = 500000
      }

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

      // If we are signed in as a safe we don't need to transfer
      if (!this.cpk.isSafeApp() && earnedCollateral) {
        transactions.push({
          to: collateralToken.address,
          data: ERC20Service.encodeTransfer(account, earnedCollateral),
        })
      }

      const txObject = await this.cpk.execTransactions(transactions, txOptions)
      const txHash = await this.getTransactionHash(txObject)
      logger.log(`Transaction hash: ${txHash}`)
      return this.provider.waitForTransaction(txHash)
    } catch (err) {
      logger.error(`Error trying to resolve condition or redeem for question id '${question.id}'`, err.message)
      throw err
    }
  }

  proxyIsUpToDate = async (): Promise<boolean> => {
    const deployed = await this.cpk.isProxyDeployed()
    if (deployed) {
      const network = await this.provider.getNetwork()
      const implementation = await this.proxy.masterCopy()
      if (implementation.toLowerCase() === getTargetSafeImplementation(network.chainId).toLowerCase()) {
        return true
      }
    }
    return false
  }

  upgradeProxyImplementation = async (): Promise<TransactionReceipt> => {
    try {
      const txOptions: TxOptions = {}
      // add plenty of gas to avoid locked proxy https://github.com/gnosis/contract-proxy-kit/issues/132
      txOptions.gas = 500000
      const network = await this.provider.getNetwork()
      const targetGnosisSafeImplementation = getTargetSafeImplementation(network.chainId)
      const transactions = [
        {
          to: this.cpk.address,
          data: this.proxy.interface.functions.changeMasterCopy.encode([targetGnosisSafeImplementation]),
        },
      ]
      const txObject = await this.cpk.execTransactions(transactions, txOptions)
      return this.provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`Error trying to update proxy`, err.message)
      throw err
    }
  }
}

export { CPKService }
