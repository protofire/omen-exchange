import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useAsyncDerivedValue, useCollateralBalance, useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { CPKService, MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcSellAmountInCollateral,
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  mulBN,
} from '../../../../util/tools'
import { BalanceItem, MarketMakerData, Status } from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { GenericError, TabsGrid } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { TokenBalance } from '../../common/token_balance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
`

const logger = getLogger('Scalar Market::Buy')

interface Props {
  fetchGraphMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketSell = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const context = useConnectedWeb3Context()
  const { library: provider } = context
  const signer = useMemo(() => provider.getSigner(), [provider])

  const {
    address: marketMakerAddress,
    balances,
    collateral,
    fee,
    outcomeTokenMarginalPrices,
    question,
    scalarHigh,
    scalarLow,
  } = marketMakerData
  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const Tabs = {
    short: 'short',
    long: 'long',
  }

  const [activeTab, setActiveTab] = useState(Tabs.short)
  const [positionIndex, setPositionIndex] = useState(0)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(balances[positionIndex])
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [amountShares, setAmountShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountSharesToDisplay, setAmountSharesToDisplay] = useState<string>('')
  const [isNegativeAmountShares, setIsNegativeAmountShares] = useState<boolean>(false)

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const walletBalance = formatNumber(formatBigNumber(collateralBalance, collateral.decimals, 5), 5)

  const lowerBound = scalarLow && Number(formatBigNumber(scalarLow, 18))
  const upperBound = scalarHigh && Number(formatBigNumber(scalarHigh, 18))

  useEffect(() => {
    setIsNegativeAmountShares(formatBigNumber(amountShares || Zero, collateral.decimals).includes('-'))
  }, [amountShares, collateral.decimals])

  useEffect(() => {
    setBalanceItem(balances[positionIndex])
    // eslint-disable-next-line
  }, [balances[positionIndex]])

  useEffect(() => {
    setPositionIndex(0)
    setBalanceItem(balances[0])
    setAmountShares(null)
    setAmountSharesToDisplay('')
    // eslint-disable-next-line
  }, [collateral.address])

  useEffect(() => {
    activeTab === Tabs.short ? setPositionIndex(0) : setPositionIndex(1)
  }, [activeTab, Tabs.short])

  const marketFeeWithTwoDecimals = Number(formatBigNumber(fee, 18))

  const calcSellAmount = useMemo(
    () => async (
      amountShares: BigNumber,
    ): Promise<[Maybe<BigNumber>, Maybe<number>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      let tradedShares: BigNumber
      let reverseTradedShares: BigNumber

      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[positionIndex]
      const holdingsOfOtherOutcome = holdings.filter((item, index) => {
        return index !== positionIndex
      })

      const amountToSell = calcSellAmountInCollateral(
        // If the transaction incur in some precision error, we need to multiply the amount by some factor, for example  amountShares.mul(99999).div(100000) , bigger the factor, less dust
        amountShares,
        holdingsOfSoldOutcome,
        holdingsOfOtherOutcome,
        marketFeeWithTwoDecimals,
      )

      if (!amountToSell) {
        logger.warn(
          `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
        )
        return [null, null, null, null]
      }

      // try {
      //   tradedShares = await marketMaker.calcSellAmount(amount, positionIndex)
      //   reverseTradedShares = await marketMaker.calcSellAmount(amount, positionIndex === 0 ? 1 : 0)
      // } catch {
      //   tradedShares = new BigNumber(0)
      //   reverseTradedShares = new BigNumber(0)
      // }

      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        positionIndex,
        amountToSell.mul(-1),
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const potentialValue = mulBN(amountToSell, 1 / (1 - marketFeeWithTwoDecimals))
      const costFee = potentialValue.sub(amountToSell)

      const newPrediction = pricesAfterTrade[1] * ((upperBound || 0) - (lowerBound || 0)) + (lowerBound || 0)

      logger.log(`Amount to sell ${amountToSell}`)
      return [costFee, newPrediction, amountToSell, potentialValue]
    },
    [balances, marketMaker, positionIndex, lowerBound, upperBound],
  )

  const [costFee, newPrediction, tradedCollateral, potentialValue] = useAsyncDerivedValue(
    amountShares || Zero,
    [new BigNumber(0), 0, amountShares, new BigNumber(0)],
    calcSellAmount,
  )

  const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100

  // const formattedNewPrediction =
  //   newPrediction && (newPrediction - (lowerBound || 0)) / ((upperBound || 0) - (lowerBound || 0))

  // const feePaid = mulBN(debouncedAmount, Number(formatBigNumber(fee, 18, 4)))
  // const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100

  // const baseCost = debouncedAmount.sub(feePaid)
  // const potentialValue = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount)
  // const potentialLossUncapped = reverseTradedShares.isZero()
  //   ? new BigNumber(0)
  //   : reverseTradedShares.sub(amount.add(feePaid))
  // const potentialLoss = reverseTradedShares.isZero()
  //   ? new BigNumber(0)
  //   : reverseTradedShares.sub(amount).lt(debouncedAmount)
  //   ? reverseTradedShares.sub(amount)
  //   : debouncedAmount

  const currentBalance = `${formatBigNumber(collateralBalance, collateral.decimals, 5)}`
  // const feeFormatted = `${formatNumber(formatBigNumber(feePaid.mul(-1), collateral.decimals))} ${collateral.symbol}`
  // const baseCostFormatted = `${formatNumber(formatBigNumber(baseCost, collateral.decimals))} ${collateral.symbol}`
  // const potentialValueFormatted = `${formatNumber(formatBigNumber(potentialValue, collateral.decimals))} ${
  //   collateral.symbol
  // }`
  // const potentialLossFormatted = `${formatNumber(formatBigNumber(potentialLoss, collateral.decimals))} ${
  //   collateral.symbol
  // }`
  // const sharesTotal = formatNumber(formatBigNumber(tradedShares, collateral.decimals))
  // const total = `${sharesTotal} Shares`

  const finish = async () => {
    const outcomeIndex = positionIndex
    try {
      if (!tradedCollateral) {
        return
      }

      const sharesAmount = formatBigNumber(amountShares || Zero, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Selling ${sharesAmount} shares ...`)

      const cpk = await CPKService.create(provider)

      await cpk.sellOutcomes({
        amount: tradedCollateral,
        conditionalTokens,
        marketMaker,
        outcomeIndex,
      })

      await fetchGraphMarketMakerData()
      await fetchCollateralBalance()

      setAmountShares(null)
      setAmountSharesToDisplay('')
      setStatus(Status.Ready)
      setMessage(`Successfully sold ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to sell '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const selectedOutcomeBalance = formatNumber(formatBigNumber(balanceItem.shares, collateral.decimals))

  const amountError =
    balanceItem.shares === null
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

  return (
    <>
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab
              active={activeTab === Tabs.short}
              onClick={() => {
                setActiveTab(Tabs.short)
                setBalanceItem(balances[0])
              }}
            >
              Short
            </ButtonTab>
            <ButtonTab
              active={activeTab === Tabs.long}
              onClick={() => {
                setActiveTab(Tabs.long)
                setBalanceItem(balances[1])
              }}
            >
              Long
            </ButtonTab>
          </TabsGrid>
          <TokenBalance text="Your Shares" value={formatNumber(selectedOutcomeBalance)} />
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmountShares(e.value)
                  setAmountSharesToDisplay('')
                }}
                style={{ width: 0 }}
                value={amountShares}
                valueToDisplay={amountSharesToDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmountShares(balanceItem.shares)
              setAmountSharesToDisplay(formatBigNumber(balanceItem.shares, collateral.decimals, 5))
            }}
            shouldDisplayMaxButton
            symbol={collateral.symbol}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow
              title={'Sell Amount'}
              value={`${formatNumber(formatBigNumber(amountShares || Zero, collateral.decimals))} Shares`}
            />
            <TransactionDetailsRow
              emphasizeValue={potentialValue ? potentialValue.gt(0) : false}
              state={ValueStates.success}
              title={'Profit'}
              value={
                potentialValue
                  ? `${formatNumber(formatBigNumber(potentialValue, collateral.decimals, 2))} ${collateral.symbol}`
                  : '0.00'
              }
            />
            <TransactionDetailsRow
              title={'Fee'}
              value={`${costFee ? formatNumber(formatBigNumber(costFee.mul(-1), collateral.decimals, 2)) : '0.00'} ${
                collateral.symbol
              }`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              emphasizeValue={
                (tradedCollateral && parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0) || false
              }
              state={
                (tradedCollateral &&
                  parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0 &&
                  ValueStates.important) ||
                ValueStates.normal
              }
              title={'Total'}
              value={`${
                tradedCollateral ? formatNumber(formatBigNumber(tradedCollateral, collateral.decimals, 2)) : '0.00'
              } ${collateral.symbol}`}
            />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>
      {isNegativeAmountShares && (
        <WarningMessage
          additionalDescription={''}
          danger={true}
          description={`Your sell amount should not be negative.`}
          href={''}
          hyperlinkDescription={''}
        />
      )}
      <StyledButtonContainer>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab('SWAP')}>
          Cancel
        </Button>
        <Button buttonType={ButtonType.primaryAlternative} disabled={isSellButtonDisabled} onClick={finish}>
          Sell Position
        </Button>
      </StyledButtonContainer>
      <ModalTransactionResult
        isOpen={isModalTransactionResultOpen}
        onClose={() => setIsModalTransactionResultOpen(false)}
        status={status}
        text={message}
        title={status === Status.Error ? 'Transaction Error' : 'Sell Shares'}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}
