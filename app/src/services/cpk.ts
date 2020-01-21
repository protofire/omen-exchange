import { ethers, Wallet } from 'ethers'
import CPK from 'contract-proxy-kit'

import { getLogger } from '../util/logger'
import { ConditionalTokenService, ERC20Service, MarketMakerService } from './index'
import { BigNumber } from 'ethers/utils'

const logger = getLogger('Services::CPKService')

interface CPKBuyOutcomesParams {
  provider: any
  cost: BigNumber
  amount: BigNumber
  outcomeIndex: number
  marketMaker: MarketMakerService
  conditionalTokens: ConditionalTokenService
}

class CPKService {
  static buyOutcomes = async ({
    provider,
    cost,
    amount,
    outcomeIndex,
    marketMaker,
    conditionalTokens,
  }: CPKBuyOutcomesParams) => {
    try {
      const signer: Wallet = provider.getSigner()
      const account = await signer.getAddress()

      const collateralAddress = await marketMaker.getCollateralToken()
      const marketMakerAddress = marketMaker.getAddress()
      const conditionalTokensAddress = conditionalTokens.getAddress()

      const cpk = await CPK.create({ ethers, signer })
      const cpkAddress = cpk.address

      // Approve amount of collateral to the CPK
      const collateralService = new ERC20Service(provider, account, collateralAddress)
      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
        account,
        cpkAddress,
        cost,
      )

      if (!hasEnoughAlowance) {
        await collateralService.approveUnlimited(cpkAddress)
      }

      logger.log(`CPK address: ${cpkAddress}`)

      const outcomeTokensToBuy = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      logger.log(`Min outcome tokens to buy: ${outcomeTokensToBuy}`)

      const conditionId = await marketMaker.getConditionId()
      const collectionId = await conditionalTokens.getCollectionIdForOutcome(
        conditionId,
        1 << outcomeIndex,
      )
      logger.debug(
        `Collection ID for outcome index ${outcomeIndex} and condition id ${conditionId} : ${collectionId}`,
      )
      const positionIdForCollectionId = await conditionalTokens.getPositionId(
        collateralAddress,
        collectionId,
      )

      const txObject = await cpk.execTransactions(
        [
          // Step 1: Transfer an amount (cost) from the user to the CPK
          {
            operation: CPK.CALL,
            to: collateralAddress,
            value: 0,
            data: ERC20Service.encodeTransferFrom(account, cpkAddress, cost),
          },
          // Step 2: Approve unlimited amount to be transferred to the market maker)
          {
            operation: CPK.CALL,
            to: collateralAddress,
            value: 0,
            data: ERC20Service.encodeApproveUnlimited(marketMakerAddress),
          },
          // Step 3: Buy outcome tokens with the CPK
          {
            operation: CPK.CALL,
            to: marketMakerAddress,
            value: 0,
            data: MarketMakerService.encodeBuy(amount, outcomeIndex, outcomeTokensToBuy),
          },
          // Step 4: Approve to move shares for the cpkAddress
          {
            operation: CPK.CALL,
            to: conditionalTokensAddress,
            value: 0,
            data: ConditionalTokenService.encodeSetApprovalForAll(cpkAddress, true),
          },
          // Step 5: Transfer outcome tokens from CPK to the user
          {
            operation: CPK.CALL,
            to: conditionalTokensAddress,
            value: 0,
            data: ConditionalTokenService.encodeSafeTransferFrom(
              cpkAddress,
              account,
              positionIdForCollectionId,
              outcomeTokensToBuy,
            ),
          },
        ],
        { gasLimit: 1000000 },
      )

      logger.log(`Transaction hash: ${txObject.hash}`)
      await provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error buying '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }
}

export { CPKService }
