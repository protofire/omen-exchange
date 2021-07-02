import { BigNumber } from 'ethers/utils'

import { Transaction } from '../../util/cpk'
import { getWrapToken, pseudoNativeAssetAddress } from '../../util/networks'
import { Token } from '../../util/types'
import { ERC20Service } from '../erc20'
import { MarketMakerService } from '../market_maker'

import { CPKService, TxOptions } from './cpk'

// @ts-expect-error ignore
export const pipe = (...fns) => input => fns.reduce((chain, func) => chain.then(func), Promise.resolve(input))

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

  if (collateral.address === pseudoNativeAssetAddress) {
    if (!service.isSafeApp) {
      txOptions.value = amount
    }
    transactions.push({
      to: getWrapToken(networkId).address,
      value: amount.toString(),
    })
  }

  return { ...params, transactions }
}

/**
 * Make an unlimited approval to the market maker for the collateral token if required
 */

interface ApproveParams {
  account: string
  amount: BigNumber
  marketMaker: MarketMakerService
  service: CPKService
  transactions: Transaction[]
}

export const approve = async (params: ApproveParams) => {
  const { account, amount, marketMaker, service, transactions } = params
  const collateralAddress = await marketMaker.getCollateralToken()
  const collateralService = new ERC20Service(service.provider, account, collateralAddress)

  const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
    service.cpk.address,
    marketMaker.address,
    amount,
  )

  if (!hasCPKEnoughAlowance) {
    transactions.push({
      to: collateralAddress,
      data: ERC20Service.encodeApproveUnlimited(marketMaker.address),
    })
  }

  return { ...params, transactions }
}

/**
 * Transfer the collateral amount to the CPK if required
 */

interface TransferParams {
  account: string
  amount: BigNumber
  collateral: Token
  marketMaker: MarketMakerService
  service: CPKService
  transactions: Transaction[]
}

export const transfer = async (params: TransferParams) => {
  const { account, amount, collateral, marketMaker, service, transactions } = params
  if (!service.isSafeApp && collateral.address !== pseudoNativeAssetAddress) {
    // Step 2: Transfer the amount of collateral being spent from the user to the CPK
    const collateralAddress = await marketMaker.getCollateralToken()
    transactions.push({
      to: collateralAddress,
      data: ERC20Service.encodeTransferFrom(account, service.cpk.address, amount),
    })
  }
  return { ...params, transactions }
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

  return { ...params, transactions }
}
