import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useAsyncDerivedValue, useCollateralBalance, useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { MarketMakerService } from '../../../../services'
import { computeBalanceAfterTrade, formatBigNumber, formatNumber } from '../../../../util/tools'
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
import { TransactionDetailsRow } from '../../common/transaction_details_row'

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

  const maybeCollateralBalance = useCollateralBalance(collateral, context)
  const collateralBalance = maybeCollateralBalance || Zero
  const walletBalance = formatNumber(formatBigNumber(collateralBalance, collateral.decimals, 5), 5)

  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number, BigNumber]> => {
      let tradedShares: BigNumber
      const positionIndex = activeTab === Tabs.short ? 0 : 1

      try {
        tradedShares = await marketMaker.calcBuyAmount(amount, positionIndex)
      } catch {
        tradedShares = new BigNumber(0)
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        positionIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const newPrediction = pricesAfterTrade[1] * 100

      return [tradedShares, newPrediction, amount]
    },
    [balances, marketMaker],
  )

  const [tradedShares, newPrediction, debouncedAmount] = useAsyncDerivedValue(
    amount,
    [new BigNumber(0), 0, amount],
    calcBuyAmount,
  )

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
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Base Cost'} value={''} />
            <TransactionDetailsRow title={'Fee'} tooltip={`A ${''}% fee goes to liquidity providers`} value={''} />
            <TransactionDetailsLine />
            <TransactionDetailsRow title={'Max. Loss'} value={''} />
            <TransactionDetailsRow title={'Max. Profit'} value={''} />
            <TransactionDetailsRow title={'Total'} value={''} />
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
