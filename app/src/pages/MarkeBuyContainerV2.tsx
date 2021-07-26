import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'

import { STANDARD_DECIMALS } from '../common/constants'
import { MarketBuy } from '../components/market/sections/market_buy/market_buy'
import { ScalarMarketBuy } from '../components/market/sections/market_buy/scalar_market_buy'
import {
  useAsyncDerivedValue,
  useCollateralBalance,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
} from '../hooks'
import { MarketMakerService } from '../services'
import { pseudoNativeAssetAddress } from '../util/networks'
import { RemoteData } from '../util/remote_data'
import { formatBigNumber, formatNumber, getInitialCollateral, mulBN } from '../util/tools'
import { calcPrediction, computeBalanceAfterTrade } from '../util/tools/fpmm/trading'
import { MarketDetailsTab, MarketMakerData, Status, Ternary, Token } from '../util/types'

interface Props {
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
}
export type SharedPropsInterface = {
  potentialProfit: BigNumber
  sharesTotal: string
  baseCost: BigNumber | undefined
  calcBuyAmount: any
  probabilitiesOrNewPrediction: number | number[]
  setOutcomeIndex: any
  outcomeIndex: number
  feePaid: BigNumber
  tradedShares: BigNumber
  marketMaker: MarketMakerService
  amount: BigNumber
  debouncedAmount: any
  setAmount: any
  isBuyDisabled: boolean
  amountError: Maybe<string>
  status: Status
  setStatus: any
  newShares: Maybe<BigNumber[]>
  setIsTransactionProcessing: any
  collateral: Token
  setCollateral: any
  proxyIsUpToDate: RemoteData<boolean>
  updateProxy: () => Promise<void>
  fetchCollateralBalance: () => Promise<void>
  collateralBalance: BigNumber
  hasZeroAllowance: Ternary
  hasEnoughAllowance: Ternary
  allowance: RemoteData<BigNumber>
  unlock: () => Promise<void>
}

const MarketBuyContainerV2: React.FC<Props> = (props: Props) => {
  const { isScalar } = props
  const context = useConnectedWeb3Context()
  const { buildMarketMaker } = useContracts(context)

  const { address: marketMakerAddress, balances, fee, scalarHigh, scalarLow } = props.marketMakerData

  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])
  //state managment
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [newShares, setNewShares] = useState<Maybe<BigNumber[]>>(null)
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [status, setStatus] = useState<Status>(Status.Ready)
  const signer = useMemo(() => context.library.getSigner(), [context.library])
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)

  const initialCollateral = getInitialCollateral(context.networkId, props.marketMakerData.collateral, context.relay)
  const [collateral, setCollateral] = useState<Token>(initialCollateral)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[] | number, BigNumber]> => {
      let tradedShares: BigNumber
      try {
        tradedShares = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      } catch {
        tradedShares = new BigNumber(0)
      }
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      if (isScalar) {
        const newPrediction = calcPrediction(
          pricesAfterTrade[1].toString(),
          scalarLow || new BigNumber(0),
          scalarHigh || new BigNumber(0),
        )

        return [tradedShares, newPrediction, amount]
      } else {
        const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)
        setNewShares(
          balances.map((balance, i) => (i === outcomeIndex ? balance.shares.add(tradedShares) : balance.shares)),
        )
        return [tradedShares, probabilities, amount]
      }
    },
    [balances, marketMaker, outcomeIndex, scalarHigh, scalarLow],
  )
  const [tradedShares, probabilitiesOrNewPrediction, debouncedAmount] = useAsyncDerivedValue(
    amount || Zero,
    [new BigNumber(0), isScalar ? balances.map(() => 0) : 0, amount],
    calcBuyAmount,
  )
  useEffect(() => {
    setIsNegativeAmount(formatBigNumber(amount, collateral.decimals, collateral.decimals).includes('-'))
  }, [amount, collateral.decimals])
  const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount || Zero)
  const sharesTotal = formatNumber(formatBigNumber(tradedShares, collateral.decimals, collateral.decimals))
  const feePaid = mulBN(debouncedAmount || Zero, Number(formatBigNumber(fee, STANDARD_DECIMALS, 4)))
  const baseCost = debouncedAmount?.sub(feePaid)
  const collateralBalance = maybeCollateralBalance || Zero
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)
  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amount))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())
  const [isNegativeAmount, setIsNegativeAmount] = useState<boolean>(false)
  const currentBalance = `${formatBigNumber(maybeCollateralBalance || Zero, collateral.decimals, 5)}`
  const amountError =
    !isScalar && isTransactionProcessing
      ? null
      : maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero() && amount?.gt(maybeCollateralBalance)
      ? `Insufficient balance`
      : amount?.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${currentBalance} ${collateral.symbol}`
      : null
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true
  const isBuyDisabled =
    (status !== Status.Ready && status !== Status.Error) ||
    amount.isZero() ||
    (!context.cpk?.isSafeApp &&
      collateral.address !== pseudoNativeAssetAddress &&
      hasEnoughAllowance !== Ternary.True) ||
    amountError !== null ||
    isNegativeAmount ||
    (!isUpdated && collateral.address === pseudoNativeAssetAddress)
  const sharedObject = {
    status,
    setStatus,
    potentialProfit,
    sharesTotal,
    baseCost,
    calcBuyAmount,
    probabilitiesOrNewPrediction,
    setOutcomeIndex,
    outcomeIndex,
    debouncedAmount,
    feePaid,
    tradedShares,
    marketMaker,
    amount,
    setAmount,
    isBuyDisabled,
    amountError,
    newShares,
    setIsTransactionProcessing,
    setCollateral,
    collateral,
    proxyIsUpToDate,
    updateProxy,
    fetchCollateralBalance,
    collateralBalance,
    hasZeroAllowance,
    hasEnoughAllowance,
    allowance,
    unlock,
  }
  return (
    <>
      {isScalar ? (
        <ScalarMarketBuy sharedProps={sharedObject} {...props} />
      ) : (
        <MarketBuy sharedProps={sharedObject} {...props} />
      )}
    </>
  )
}

export { MarketBuyContainerV2 }
