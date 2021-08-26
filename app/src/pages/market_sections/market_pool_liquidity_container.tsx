import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'

import { STANDARD_DECIMALS } from '../../common/constants'
import { MarketPoolLiquidity } from '../../components/market/market_pooling/market_pool_liquidity'
import { ScalarMarketPoolLiquidity } from '../../components/market/market_pooling/scalar_market_pool_liquidity'
import { useConnectedWeb3Context } from '../../contexts'
import {
  useCollateralBalance,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
  useFundingBalance,
  useRelay,
} from '../../hooks'
import { getLogger } from '../../util/logger'
import { pseudoNativeAssetAddress } from '../../util/networks'
import { RemoteData } from '../../util/remote_data'
import {
  bigNumberToString,
  calcPoolTokens,
  calcRemoveFundingSendAmounts,
  getInitialCollateral,
  isDust,
} from '../../util/tools'
import { MarketDetailsTab, MarketMakerData, Ternary, Token, TransactionStep } from '../../util/types'

interface Props {
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
  switchMarketTab: (arg0: MarketDetailsTab) => void
  isScalar: boolean
}

enum Tabs {
  deposit,
  withdraw,
}

export type SharedPropsInterface = {
  disableDepositButton: boolean
  sharesAmountError: string | null
  disableWithdrawButton: boolean
  disableWithdrawTab: boolean
  totalUserLiquidity: BigNumber
  showUpgrade: boolean
  collateralAmountError: Maybe<string>
  upgradeProxy: () => Promise<void>
  feeFormatted: string
  poolTokens: BigNumber
  addFunding: () => Promise<void>
  removeFunding: () => Promise<void>
  showSetAllowance: boolean
  depositedTokensTotal: BigNumber
  depositedTokens: BigNumber
  unlockCollateral: () => Promise<void>
  shouldDisplayMaxButton: boolean
  allowanceFinished: boolean
  txHash: string
  txState: TransactionStep
  walletBalance: string
  sharesBalance: string
  collateral: Token
  allowance: RemoteData<BigNumber>
  proxyIsUpToDate: RemoteData<boolean>
  upgradeFinished: boolean
  fundingBalance: BigNumber
  collateralBalance: BigNumber
  disableDepositTab: boolean
  isTransactionModalOpen: boolean
  setIsTransactionModalOpen: any
  activeTab: Tabs
  setActiveTab: any
  amountToFund: Maybe<BigNumber>
  setAmountToFund: any
  amountToFundDisplay: string
  setAmountToFundDisplay: any
  isNegativeAmountToFund: boolean
  setIsNegativeAmountToFund: any
  isNegativeAmountToRemove: boolean
  setIsNegativeAmountToRemove: any
  message: string
  setMessage: any
  amountToRemoveDisplay: string
  setAmountToRemoveDisplay: any
  amountToRemove: Maybe<BigNumber>
  setAmountToRemove: any
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, isScalar, marketMakerData } = props
  const context = useConnectedWeb3Context()

  const { address: marketMakerAddress, balances, fee, totalPoolShares, userEarnings } = marketMakerData
  const { account, cpk, library: provider, relay, setTxState, txHash, txState } = context
  const { fetchBalances } = context.balances
  const signer = useMemo(() => provider.getSigner(), [provider])
  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)
  const initialCollateral = getInitialCollateral(context.networkId, marketMakerData.collateral, relay)
  const currentDate = new Date().getTime()
  const resolutionDate = marketMakerData.question.resolution.getTime()
  const disableDepositTab = currentDate > resolutionDate

  const [amountToFund, setAmountToFund] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [collateral, setCollateral] = useState<Token>(initialCollateral)
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)
  const [isNegativeAmountToFund, setIsNegativeAmountToFund] = useState<boolean>(false)
  const [amountToFundDisplay, setAmountToFundDisplay] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [amountToRemove, setAmountToRemove] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState(disableDepositTab ? Tabs.withdraw : Tabs.deposit)
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const [amountToRemoveDisplay, setAmountToRemoveDisplay] = useState<string>('')
  const [isNegativeAmountToRemove, setIsNegativeAmountToRemove] = useState<boolean>(false)
  const [upgradeFinished, setUpgradeFinished] = useState(false)

  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)
  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountToFund || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())
  const { fetchFundingBalance, fundingBalance: maybeFundingBalance } = useFundingBalance(marketMakerAddress, context)
  const fundingBalance = maybeFundingBalance || Zero
  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )
  const feeFormatted = useMemo(() => `${bigNumberToString(fee.mul(Math.pow(10, 2)), STANDARD_DECIMALS)}%`, [fee])
  const collateralBalance = maybeCollateralBalance || Zero
  const walletBalance = bigNumberToString(collateralBalance, collateral.decimals, 5)
  const sharesBalance = bigNumberToString(fundingBalance, collateral.decimals)

  const { relayFeeGreaterThanAmount, relayFeeGreaterThanBalance } = useRelay(
    amountToFund || new BigNumber(0),
    collateral,
  )

  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true

  const collateralAmountError = isTransactionProcessing
    ? null
    : maybeCollateralBalance === null
    ? null
    : relayFeeGreaterThanBalance
    ? 'Insufficient Dai in your Omen Account'
    : maybeCollateralBalance.isZero() && amountToFund?.gt(maybeCollateralBalance)
    ? `Insufficient balance`
    : amountToFund?.gt(maybeCollateralBalance)
    ? `Value must be less than or equal to ${walletBalance} ${collateral.symbol}`
    : relayFeeGreaterThanAmount
    ? 'Relay fee is greater than buy amount'
    : null

  const sharesAmountError = isTransactionProcessing
    ? null
    : maybeFundingBalance === null
    ? null
    : maybeFundingBalance.isZero() && amountToRemove?.gt(maybeFundingBalance)
    ? `Insufficient balance`
    : amountToRemove?.gt(fundingBalance)
    ? `Value must be less than or equal to ${sharesBalance} pool shares`
    : null

  const disableWithdrawButton =
    !amountToRemove ||
    amountToRemove?.isZero() ||
    amountToRemove?.gt(fundingBalance) ||
    sharesAmountError !== null ||
    isNegativeAmountToRemove

  const disableDepositButton =
    !amountToFund ||
    amountToFund?.isZero() ||
    (!cpk?.isSafeApp && collateral.address !== pseudoNativeAssetAddress && hasEnoughAllowance !== Ternary.True) ||
    collateralAmountError !== null ||
    currentDate > resolutionDate ||
    isNegativeAmountToFund ||
    relayFeeGreaterThanAmount

  const totalUserShareAmounts = calcRemoveFundingSendAmounts(
    fundingBalance,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const upgradeProxy = async () => {
    if (!cpk) {
      return
    }

    await updateProxy()
    setUpgradeFinished(true)
  }

  const logger = getLogger(isScalar ? 'Scalar Market::Fund' : 'Market::Fund')

  const addFunding = async () => {
    try {
      if (!cpk) {
        return
      }
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }
      if (!cpk?.isSafeApp && collateral.address !== pseudoNativeAssetAddress && hasEnoughAllowance !== Ternary.True) {
        throw new Error("This method shouldn't be called if 'hasEnoughAllowance' is unknown or false")
      }

      const fundsAmount = bigNumberToString(amountToFund || Zero, collateral.decimals)

      setMessage(`Depositing funds: ${fundsAmount} ${collateral.symbol}...`)

      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionProcessing(true)
      setIsTransactionModalOpen(true)

      await cpk.addFunding({
        amount: amountToFund || Zero,
        collateral,
        marketMaker,
      })

      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await fetchBalances()

      setAmountToFund(null)
      setAmountToFundDisplay('')
      setMessage(`Successfully deposited ${fundsAmount} ${collateral.symbol}`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setTxState(TransactionStep.error)
      setMessage(`Error trying to deposit funds.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
  }

  const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(
    amountToRemove || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const depositedTokens = sendAmountsAfterRemovingFunding.length
    ? sendAmountsAfterRemovingFunding.reduce((min: BigNumber, amount: BigNumber) => (amount.lt(min) ? amount : min))
    : new BigNumber(0)
  const depositedTokensTotal = depositedTokens.add(userEarnings)

  const removeFunding = async () => {
    try {
      if (!cpk) {
        return
      }

      const fundsAmount = bigNumberToString(depositedTokensTotal, collateral.decimals)

      setMessage(`Withdrawing funds: ${fundsAmount} ${collateral.symbol}...`)

      const conditionId = await marketMaker.getConditionId()

      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionProcessing(true)
      setIsTransactionModalOpen(true)
      await cpk.removeFunding({
        amountToMerge: depositedTokens,
        conditionId,
        conditionalTokens,
        earnings: userEarnings,
        marketMaker,
        outcomesCount: balances.length,
        sharesToBurn: amountToRemove || Zero,
      })
      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await fetchBalances()

      setAmountToRemove(null)
      setAmountToRemoveDisplay('')
      setMessage(`Successfully withdrew ${fundsAmount} ${collateral.symbol}`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setTxState(TransactionStep.error)
      setMessage(`Error trying to withdraw funds.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
  }

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()

    setAllowanceFinished(true)
  }

  const totalDepositedTokens = totalUserShareAmounts.length
    ? totalUserShareAmounts.reduce((min: BigNumber, amount: BigNumber) => (amount.lt(min) ? amount : min))
    : new BigNumber(0)
  const totalUserLiquidity = totalDepositedTokens.add(userEarnings)

  const poolTokens = calcPoolTokens(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const disableWithdrawTab = activeTab !== Tabs.withdraw && isDust(totalUserLiquidity, collateral.decimals)

  useEffect(() => {
    setIsNegativeAmountToFund((amountToFund || Zero).lt(Zero))
  }, [amountToFund, collateral.decimals])

  useEffect(() => {
    setIsNegativeAmountToRemove((amountToRemove || Zero).lt(Zero))
  }, [amountToRemove, collateral.decimals])

  const showSetAllowance =
    collateral.address !== pseudoNativeAssetAddress &&
    !cpk?.isSafeApp &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  const showUpgrade =
    (!isUpdated && collateral.address === pseudoNativeAssetAddress) ||
    (upgradeFinished && collateral.address === pseudoNativeAssetAddress)

  const shouldDisplayMaxButton = collateral.address !== pseudoNativeAssetAddress

  useEffect(() => {
    setCollateral(initialCollateral)
    setAmountToFund(null)
    setAmountToFundDisplay('')
    setAmountToRemove(null)
    setAmountToRemoveDisplay('')
    // eslint-disable-next-line
  }, [marketMakerData.collateral.address])

  const sharedObject = {
    disableDepositButton,
    sharesAmountError,
    disableWithdrawButton,
    disableWithdrawTab,
    totalUserLiquidity,
    showUpgrade,
    collateralAmountError,
    upgradeProxy,
    feeFormatted,
    poolTokens,
    addFunding,
    removeFunding,
    showSetAllowance,
    depositedTokensTotal,
    depositedTokens,
    unlockCollateral,
    shouldDisplayMaxButton,
    allowanceFinished,
    txHash,
    txState,
    walletBalance,
    sharesBalance,
    collateral,
    allowance,
    proxyIsUpToDate,
    upgradeFinished,
    fundingBalance,
    collateralBalance,
    disableDepositTab,
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    activeTab,
    setActiveTab,
    amountToFund,
    setAmountToFund,
    amountToFundDisplay,
    setAmountToFundDisplay,
    isNegativeAmountToFund,
    setIsNegativeAmountToFund,
    isNegativeAmountToRemove,
    setIsNegativeAmountToRemove,
    message,
    setMessage,
    amountToRemove,
    setAmountToRemove,
    amountToRemoveDisplay,
    setAmountToRemoveDisplay,
  }

  return (
    <>
      {isScalar ? (
        <ScalarMarketPoolLiquidity sharedProps={sharedObject} {...props} />
      ) : (
        <MarketPoolLiquidity sharedProps={sharedObject} {...props} />
      )}
    </>
  )
}

export { MarketPoolLiquidityContainer }
