import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'

import { STANDARD_DECIMALS } from '../../common/constants'
import { MarketSell } from '../../components/market/market_sell/market_sell'
import { ScalarMarketSell } from '../../components/market/market_sell/scalar_market_sell'
import { useConnectedWeb3Context } from '../../contexts'
import { useAsyncDerivedValue, useContracts, useRelay } from '../../hooks'
import { MarketMakerService } from '../../services'
import { getLogger } from '../../util/logger'
import {
  bigNumberToNumber,
  bigNumberToString,
  calcPrediction,
  calcSellAmountInCollateral,
  computeBalanceAfterTrade,
  getInitialCollateral,
  mulBN,
} from '../../util/tools'
import { BalanceItem, MarketDetailsTab, MarketMakerData, Status, Token, TransactionStep } from '../../util/types'

const logger = getLogger('Market::Sell')

interface Props {
  currentTab: MarketDetailsTab
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
}

export type SharedPropsInterface = {
  isSellButtonDisabled: boolean
  calcSellAmount: any
  finish: () => Promise<void>
  amountError: string | null
  isNegativeAmountShares: boolean
  setAmountSharesToDisplay: any
  amountSharesToDisplay: string
  selectedOutcomeBalance: string
  setAmountSharesFromInput: any
  isTransactionModalOpen: boolean
  setIsTransactionModalOpen: any
  balanceItem: BalanceItem
  outcomeIndex: number
  positionIndex: number
  setPositionIndex: any
  setOutcomeIndex: any
  setBalanceItem: any
  collateral: Token
  costFee: Maybe<BigNumber>
  probabilitiesOrNewPrediction: any
  tradedCollateral: Maybe<BigNumber>
  potentialValue: Maybe<BigNumber>
  amountShares: Maybe<BigNumber>
  setAmountShares: any
  displaySellShares: Maybe<BigNumber>
  message: string
  txHash: string
  txState: TransactionStep
  relayFeeGreaterThanBalance: boolean
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, fetchGraphMarketUserTxData, isScalar, marketMakerData } = props
  const context = useConnectedWeb3Context()
  const { cpk, networkId, relay, setTxState, txHash, txState } = context
  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const { fetchBalances } = context.balances
  const { address: marketMakerAddress, balances, fee, scalarHigh, scalarLow } = marketMakerData
  const initialCollateral = getInitialCollateral(networkId, marketMakerData.collateral, relay)

  const [collateral, setCollateral] = useState<Token>(initialCollateral)
  const [amountShares, setAmountShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [positionIndex, setPositionIndex] = useState(balances[0].shares.gte(balances[1].shares) ? 0 : 1)
  const [isNegativeAmountShares, setIsNegativeAmountShares] = useState<boolean>(false)
  const [displaySellShares, setDisplaySellShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [amountSharesToDisplay, setAmountSharesToDisplay] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const { relayFeeGreaterThanBalance } = useRelay()

  let defaultOutcomeIndex = 0
  for (let i = 0; i < balances.length; i++) {
    const shares = bigNumberToNumber(balances[i].shares, collateral.decimals)
    if (shares > 0) {
      defaultOutcomeIndex = i
      break
    }
  }

  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const [outcomeIndex, setOutcomeIndex] = useState<number>(defaultOutcomeIndex)
  const indexToUse = isScalar ? positionIndex : outcomeIndex
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(marketMakerData.balances[indexToUse])

  const selectedOutcomeBalance = bigNumberToString(balanceItem.shares, collateral.decimals)

  useEffect(() => {
    if (isScalar) setPositionIndex(balances[0].shares.gte(balances[1].shares) ? 0 : 1)
    else setOutcomeIndex(defaultOutcomeIndex)

    setBalanceItem(balances[indexToUse])
    setAmountShares(null)
    setAmountSharesToDisplay('')
    setCollateral(initialCollateral)
    // eslint-disable-next-line
  }, [marketMakerData.collateral.address])

  useEffect(() => {
    setBalanceItem(balances[indexToUse])
    // eslint-disable-next-line
  }, [balances[indexToUse]])

  useEffect(() => {
    setIsNegativeAmountShares((amountShares || Zero).lt(Zero))
  }, [amountShares, collateral.decimals])

  const amountError = isTransactionProcessing
    ? null
    : balanceItem.shares === null
    ? null
    : balanceItem.shares.isZero() && amountShares?.gt(balanceItem.shares)
    ? `Insufficient balance`
    : amountShares?.gt(balanceItem.shares)
    ? `Value must be less than or equal to ${selectedOutcomeBalance} shares`
    : null

  const isSellButtonDisabled =
    !amountShares ||
    (status !== Status.Ready && status !== Status.Error) ||
    amountShares?.isZero() ||
    amountError !== null ||
    isNegativeAmountShares

  const calcSellAmount = useMemo(
    () => async (
      amountShares: BigNumber,
    ): Promise<[Maybe<BigNumber>, Maybe<number | number[]>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[indexToUse]
      const holdingsOfOtherOutcomes = holdings.filter((item, index) => {
        return index !== indexToUse
      })
      const marketFeeWithTwoDecimals = bigNumberToNumber(fee, STANDARD_DECIMALS)
      const amountToSell = calcSellAmountInCollateral(
        // Round down in case of precision error
        amountShares.mul(99999999).div(100000000),
        holdingsOfSoldOutcome,
        holdingsOfOtherOutcomes,
        marketFeeWithTwoDecimals,
      )

      if (!amountToSell) {
        logger.warn(
          `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
        )
        if (isScalar) return [null, 0, null, null]
        else return [null, [], null, null]
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        isScalar ? balances.map(b => b.holdings) : holdings,
        indexToUse,
        amountToSell.mul(-1), // negate amounts because it's a sale
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const potentialValue = mulBN(amountToSell, 1 / (1 - marketFeeWithTwoDecimals))
      const costFee = potentialValue.sub(amountToSell)

      logger.log(`Amount to sell ${amountToSell}`)
      if (isScalar) {
        const newPrediction = calcPrediction(
          pricesAfterTrade[1].toString(),
          scalarLow || new BigNumber(0),
          scalarHigh || new BigNumber(0),
        )
        return [costFee, newPrediction, amountToSell, potentialValue]
      } else {
        const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)

        return [costFee, probabilities, amountToSell, potentialValue]
      }
    },
    [indexToUse, balances, fee, scalarLow, scalarHigh, isScalar],
  )

  const [costFee, probabilitiesOrNewPrediction, tradedCollateral, potentialValue] = useAsyncDerivedValue(
    amountShares || Zero,
    isScalar ? [new BigNumber(0), 0, amountShares, new BigNumber(0)] : [null, balances.map(() => 0), null, null],
    calcSellAmount,
  )

  const setAmountSharesFromInput = (shares: BigNumber) => {
    setAmountShares(shares)
    setDisplaySellShares(shares)
  }

  const finish = async () => {
    try {
      if (!tradedCollateral) {
        return
      }

      if (!cpk) {
        return
      }
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionProcessing(true)
      setIsTransactionModalOpen(true)
      const sharesAmount = bigNumberToString(amountShares || Zero, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Selling ${sharesAmount} shares...`)

      await cpk.sellOutcomes({
        amount: tradedCollateral,
        outcomeIndex: indexToUse,
        marketMaker,
        conditionalTokens,
      })

      await fetchGraphMarketUserTxData()
      await fetchGraphMarketMakerData()
      await fetchBalances()
      setAmountSharesFromInput(new BigNumber('0'))
      setDisplaySellShares(null)
      setAmountShares(null)
      setStatus(Status.Ready)
      setMessage(`Successfully sold ${sharesAmount} ${balances[indexToUse].outcomeName} shares.`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setStatus(Status.Error)
      setTxState(TransactionStep.error)
      setMessage(`Error trying to sell '${balances[indexToUse].outcomeName}' shares.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
  }

  const sharedObject = {
    isSellButtonDisabled,
    amountShares,
    calcSellAmount,
    finish,
    amountError,
    isNegativeAmountShares,
    setAmountSharesToDisplay,
    amountSharesToDisplay,
    selectedOutcomeBalance,
    setAmountSharesFromInput,
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    balanceItem,
    outcomeIndex,
    positionIndex,
    setBalanceItem,
    setPositionIndex,
    setOutcomeIndex,
    collateral,
    costFee,
    probabilitiesOrNewPrediction,
    tradedCollateral,
    potentialValue,
    setAmountShares,
    displaySellShares,
    message,
    txHash,
    txState,
    relayFeeGreaterThanBalance,
  }

  return (
    <>
      {isScalar ? (
        <ScalarMarketSell sharedProps={sharedObject} {...props} />
      ) : (
        <MarketSell sharedProps={sharedObject} {...props} />
      )}
    </>
  )
}

export { MarketSellContainer }
