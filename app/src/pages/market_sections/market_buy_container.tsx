import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'

import { STANDARD_DECIMALS } from '../../common/constants'
import { MarketBuy } from '../../components/market/sections/market_buy/market_buy'
import { ScalarMarketBuy } from '../../components/market/sections/market_buy/scalar_market_buy'
import {
  ConnectedWeb3Context,
  useAsyncDerivedValue,
  useCollateralBalance,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
} from '../../hooks'
import { CPKService, MarketMakerService } from '../../services'
import { getNativeAsset, pseudoNativeAssetAddress } from '../../util/networks'
import { RemoteData } from '../../util/remote_data'
import { bigNumberToNumber, bigNumberToString, getInitialCollateral, mulBN } from '../../util/tools'
import { calcPrediction, computeBalanceAfterTrade } from '../../util/tools/fpmm/trading'
import { MarketDetailsTab, MarketMakerData, Status, Ternary, Token, TransactionStep } from '../../util/types'

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
  setNewShares: any
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
  initialCollateral: Token
  nativeAsset: Token
  cpk: Maybe<CPKService>
  context: ConnectedWeb3Context
  isNegativeAmount: boolean
  setIsNegativeAmount: any
  amountDisplay: string
  setAmountDisplay: any
  unlockCollateral: () => Promise<void>
  allowanceFinished: boolean
  setAllowanceFinished: any
  fetchBalances: () => Promise<void>
  displayFundAmount: Maybe<BigNumber>
  setDisplayFundAmount: any
  showUpgrade: boolean
  upgradeFinished: boolean
  setUpgradeFinished: any
  shouldDisplayMaxButton: boolean
  upgradeProxy: () => Promise<void>
  isTransactionModalOpen: boolean
  setIsTransactionModalOpen: any
  feePercentage: number
  showSetAllowance: boolean
  feeFormatted: string
  potentialProfitFormatted: string
  total: string
  setDisplayAmountToFund: any
  baseCostFormatted: string
  txHash: string
  setTxState: any
  txState: TransactionStep
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props
  const context = useConnectedWeb3Context()
  const { buildMarketMaker } = useContracts(context)

  const signer = useMemo(() => context.library.getSigner(), [context.library])

  const { address: marketMakerAddress, balances, fee, scalarHigh, scalarLow } = props.marketMakerData
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  //state managment
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [newShares, setNewShares] = useState<Maybe<BigNumber[]>>(null)
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)
  const [amountDisplay, setAmountDisplay] = useState<string>('')

  const nativeAsset = getNativeAsset(context.networkId, context.relay)

  const initialCollateral = getInitialCollateral(context.networkId, props.marketMakerData.collateral, context.relay)
  const [collateral, setCollateral] = useState<Token>(initialCollateral)

  const feePercentage = bigNumberToNumber(fee, STANDARD_DECIMALS) * 100

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )

  useEffect(() => {
    setIsNegativeAmount((amount || Zero).lt(Zero))
  }, [amount, collateral.decimals])

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
    [balances, marketMaker, outcomeIndex, scalarHigh, scalarLow, isScalar],
  )

  const [tradedShares, probabilitiesOrNewPrediction, debouncedAmount] = useAsyncDerivedValue(
    amount || Zero,
    [new BigNumber(0), !isScalar ? balances.map(() => 0) : 0, amount],
    calcBuyAmount,
  )

  useEffect(() => {
    setIsNegativeAmount((amount || Zero).lt(Zero))
  }, [amount, collateral.decimals])

  const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount || Zero)

  const feePaid = mulBN(debouncedAmount, bigNumberToNumber(fee, STANDARD_DECIMALS))
  const feeFormatted = `${bigNumberToString(feePaid.mul(-1), collateral.decimals)}
  ${collateral.symbol}`

  const potentialProfitFormatted = `${bigNumberToString(potentialProfit, collateral.decimals)} ${collateral.symbol}`

  const baseCost = debouncedAmount?.sub(feePaid)
  const baseCostFormatted = `${bigNumberToString(baseCost || Zero, collateral.decimals)}
  ${collateral.symbol}`

  const collateralBalance = maybeCollateralBalance || Zero
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)
  const [isNegativeAmount, setIsNegativeAmount] = useState<boolean>(false)
  const currentBalance = `${bigNumberToString(collateralBalance, collateral.decimals, 5)}`
  const [displayFundAmount, setDisplayFundAmount] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const { fetchBalances } = context.balances

  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amount))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  const showSetAllowance =
    collateral.address !== pseudoNativeAssetAddress &&
    !context.cpk?.isSafeApp &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

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

  const unlockCollateral = async () => {
    if (!context.cpk) {
      return
    }

    await unlock()
    setAllowanceFinished(true)
  }

  const setDisplayAmountToFund = (value: BigNumber) => {
    setAmount(value)
    setDisplayFundAmount(value)
  }

  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true

  const showUpgrade =
    (!isUpdated && collateral.address === pseudoNativeAssetAddress) ||
    (upgradeFinished && collateral.address === pseudoNativeAssetAddress)

  const upgradeProxy = async () => {
    if (!context.cpk) {
      return
    }

    await updateProxy()
    setUpgradeFinished(true)
  }

  const isBuyDisabled =
    !amount ||
    (status !== Status.Ready && status !== Status.Error) ||
    amount.isZero() ||
    (!context.cpk?.isSafeApp &&
      collateral.address !== pseudoNativeAssetAddress &&
      hasEnoughAllowance !== Ternary.True) ||
    amountError !== null ||
    isNegativeAmount ||
    (!isUpdated && collateral.address === pseudoNativeAssetAddress)

  const shouldDisplayMaxButton = collateral.address !== pseudoNativeAssetAddress
  const sharesTotal = bigNumberToString(tradedShares, collateral.decimals)
  const total = `${sharesTotal} Shares`

  const sharedObject = {
    status,
    setStatus,
    setNewShares,
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
    initialCollateral,
    nativeAsset,
    cpk: context.cpk,
    context,
    isNegativeAmount,
    setIsNegativeAmount,
    amountDisplay,
    setAmountDisplay,
    unlockCollateral,
    allowanceFinished,
    setAllowanceFinished,
    fetchBalances,
    displayFundAmount,
    setDisplayFundAmount,
    showUpgrade,
    shouldDisplayMaxButton,
    setUpgradeFinished,
    upgradeFinished,
    upgradeProxy,
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    feePercentage,
    showSetAllowance,
    feeFormatted,
    potentialProfitFormatted,
    total,
    setDisplayAmountToFund,
    baseCostFormatted,
    txHash: context.txHash,
    setTxState: context.setTxState,
    txState: context.txState,
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

export { MarketBuyContainer }
