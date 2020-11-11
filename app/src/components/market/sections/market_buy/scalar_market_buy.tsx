import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useAsyncDerivedValue, useCollateralBalance, useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { MarketMakerService } from '../../../../services'
import { computeBalanceAfterTrade, formatBigNumber, formatNumber, mulBN } from '../../../../util/tools'
import { MarketMakerData } from '../../../../util/types'
import { ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketBuy = (props: Props) => {
  const { marketMakerData, switchMarketTab } = props
  const context = useConnectedWeb3Context()

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
  const { buildMarketMaker } = useContracts(context)
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const Tabs = {
    short: 'short',
    long: 'long',
  }

  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [amountDisplay, setAmountDisplay] = useState<string>('')
  const [activeTab, setActiveTab] = useState(Tabs.short)
  const [positionIndex, setPositionIndex] = useState(0)

  const maybeCollateralBalance = useCollateralBalance(collateral, context)
  const collateralBalance = maybeCollateralBalance || Zero
  const walletBalance = formatNumber(formatBigNumber(collateralBalance, collateral.decimals, 5), 5)

  const lowerBound = scalarLow && Number(formatBigNumber(scalarLow, 18))
  const upperBound = scalarHigh && Number(formatBigNumber(scalarHigh, 18))

  useEffect(() => {
    activeTab === Tabs.short ? setPositionIndex(0) : setPositionIndex(1)
  }, [activeTab])

  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number, BigNumber, BigNumber]> => {
      let tradedShares: BigNumber
      let reverseTradedShares: BigNumber

      try {
        tradedShares = await marketMaker.calcBuyAmount(amount, positionIndex)
        reverseTradedShares = await marketMaker.calcBuyAmount(amount, positionIndex === 0 ? 1 : 0)
      } catch {
        tradedShares = new BigNumber(0)
        reverseTradedShares = new BigNumber(0)
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        positionIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const newPrediction = pricesAfterTrade[1] * ((upperBound || 0) - (lowerBound || 0)) + (lowerBound || 0)

      return [tradedShares, newPrediction, amount, reverseTradedShares]
    },
    [balances, marketMaker, positionIndex],
  )

  const [tradedShares, newPrediction, debouncedAmount, reverseTradedShares] = useAsyncDerivedValue(
    amount,
    [new BigNumber(0), 0, amount, new BigNumber(0)],
    calcBuyAmount,
  )
  console.log(tradedShares)
  console.log(newPrediction)
  console.log(debouncedAmount)

  const feePaid = mulBN(debouncedAmount, Number(formatBigNumber(fee, 18, 4)))
  const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100

  const baseCost = debouncedAmount.sub(feePaid)
  const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount)
  const potentialLoss = reverseTradedShares.isZero() ? new BigNumber(0) : reverseTradedShares.sub(amount)

  const currentBalance = `${formatBigNumber(collateralBalance, collateral.decimals, 5)}`
  const feeFormatted = `${formatNumber(formatBigNumber(feePaid.mul(-1), collateral.decimals))} ${collateral.symbol}`
  const baseCostFormatted = `${formatNumber(formatBigNumber(baseCost, collateral.decimals))} ${collateral.symbol}`
  const potentialProfitFormatted = `${formatNumber(formatBigNumber(potentialProfit, collateral.decimals))} ${
    collateral.symbol
  }`
  const potentialLossFormatted = `${formatNumber(formatBigNumber(potentialLoss, collateral.decimals))} ${
    collateral.symbol
  }`
  const sharesTotal = formatNumber(formatBigNumber(tradedShares, collateral.decimals))
  const total = `${sharesTotal} Shares`

  return (
    <>
      <MarketScale
        currentPrediction={outcomeTokenMarginalPrices[1]}
        lowerBound={scalarLow || new BigNumber(0)}
        startingPointTitle={'Current prediction'}
        unit={question.title ? question.title.split('[')[1].split(']')[0] : ''}
        upperBound={scalarHigh || new BigNumber(0)}
      />
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab active={activeTab === Tabs.short} onClick={() => setActiveTab(Tabs.short)}>
              Short
            </ButtonTab>
            <ButtonTab active={activeTab === Tabs.long} onClick={() => setActiveTab(Tabs.long)}>
              Long
            </ButtonTab>
          </TabsGrid>
          <CurrenciesWrapper>
            <CurrencySelector
              balance={walletBalance}
              context={context}
              currency={collateral.address}
              disabled
              onSelect={() => null}
            />
          </CurrenciesWrapper>
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmount(e.value)
                  setAmountDisplay('')
                }}
                style={{ width: 0 }}
                value={amount}
                valueToDisplay={amountDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmount(collateralBalance)
              setAmountDisplay(walletBalance)
            }}
            shouldDisplayMaxButton
            symbol={collateral.symbol}
          />
          <ReactTooltip id="walletBalanceTooltip" />
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Base Cost'} value={baseCostFormatted} />
            <TransactionDetailsRow
              title={'Fee'}
              tooltip={`A ${feePercentage}% fee goes to liquidity providers`}
              value={feeFormatted}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow title={'Max. Loss'} value={potentialLossFormatted} />
            <TransactionDetailsRow
              emphasizeValue={potentialProfit.gt(0)}
              state={ValueStates.success}
              title={'Max. Profit'}
              value={potentialProfitFormatted}
            />
            <TransactionDetailsRow title={'Total'} value={total} />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>
      <StyledButtonContainer>
        <MarketBottomNavButton buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab('SWAP')}>
          Cancel
        </MarketBottomNavButton>
        {/* TODO: Add isBuyDisabled and onClick handler */}
        <MarketBottomNavButton buttonType={ButtonType.secondaryLine}>Buy Position</MarketBottomNavButton>
      </StyledButtonContainer>
    </>
  )
}
