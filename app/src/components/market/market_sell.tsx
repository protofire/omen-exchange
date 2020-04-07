import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { MARKET_FEE } from '../../common/constants'
import { useAsyncDerivedValue, useContracts } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { CPKService, MarketMakerService } from '../../services'
import { getLogger } from '../../util/logger'
import { calcSellAmountInCollateral, computeBalanceAfterTrade, formatBigNumber, mulBN } from '../../util/tools'
import { BalanceItem, OutcomeTableValue, Status, Token } from '../../util/types'
import { Button, ButtonContainer } from '../button'
import { ButtonType } from '../button/button_styling_types'
import {
  BigNumberInput,
  GridTransactionDetails,
  SectionTitle,
  TextfieldCustomPlaceholder,
  ViewCard,
  WalletBalance,
} from '../common'
import { BigNumberInputReturn } from '../common/big_number_input'
import { FullLoading } from '../loading'

import { MarketTopDetails } from './market_top_details'
import { OutcomeTable } from './outcome_table'
import { TransactionDetailsCard } from './transaction_details_card'
import { TransactionDetailsLine } from './transaction_details_line'
import { TransactionDetailsRow, ValueStates } from './transaction_details_row'

const LeftButton = styled(Button)`
  margin-right: auto;
`

const logger = getLogger('Market::Sell')

interface Props extends RouteComponentProps<any> {
  balances: BalanceItem[]
  collateral: Token
  marketMakerAddress: string
  question: string
  resolution: Maybe<Date>
}

const MarketSellWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { buildMarketMaker, conditionalTokens } = useContracts(context)

  const { balances, collateral, marketMakerAddress, question } = props

  const marketMaker = buildMarketMaker(marketMakerAddress)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(balances[outcomeIndex])
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')

  const marketFeeWithTwoDecimals = MARKET_FEE / Math.pow(10, 2)

  const calcSellAmount = useMemo(
    () => async (
      amountShares: BigNumber,
    ): Promise<[number[], Maybe<BigNumber>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[outcomeIndex]
      const holdingsOfOtherOutcomes = holdings.filter((item, index) => {
        return index !== outcomeIndex
      })

      const amountToSell = calcSellAmountInCollateral(
        amountShares.mul(99999).div(100000), // because of some precision error, we need to multiply the amount by 0.99999
        holdingsOfSoldOutcome,
        holdingsOfOtherOutcomes,
        marketFeeWithTwoDecimals,
      )

      if (!amountToSell) {
        logger.warn(
          `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
        )
        return [[], null, null, null]
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        holdings,
        outcomeIndex,
        amountToSell.mul(-1), // negate amounts because it's a sale
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const costFee = mulBN(amountToSell, marketFeeWithTwoDecimals)
      const potentialValue = amountToSell.sub(costFee)

      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)

      return [probabilities, costFee, amountToSell, potentialValue]
    },
    [outcomeIndex, balances, marketFeeWithTwoDecimals],
  )

  const [probabilities, costFee, tradedCollateral, potentialValue] = useAsyncDerivedValue(
    amountShares,
    [balances.map(() => 0), null, null, null],
    calcSellAmount,
  )

  const haveEnoughShares = balanceItem && amountShares.lte(balanceItem.shares)

  const finish = async () => {
    try {
      if (!haveEnoughShares) {
        throw new Error('There are not enough shares to sell')
      }
      if (!tradedCollateral) {
        return
      }

      setStatus(Status.Loading)
      setMessage(`Selling ${formatBigNumber(amountShares, collateral.decimals)} shares ...`)

      const cpk = await CPKService.create(context.library)

      await cpk.sellOutcomes({
        amount: tradedCollateral,
        outcomeIndex,
        marketMaker,
        conditionalTokens,
      })

      setAmountShares(new BigNumber(0))
      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to sell: ${err.message}`)
    }
  }

  const error = (status !== Status.Ready && status !== Status.Error) || amountShares.isZero() || !haveEnoughShares

  const noteAmount = `${formatBigNumber(balanceItem.shares, collateral.decimals)} shares`

  return (
    <>
      <SectionTitle goBackEnabled title={question} />
      <ViewCard>
        <MarketTopDetails
          marketMakerAddress={marketMakerAddress}
          title="Choose the shares you want to sell"
          toggleTitleAction="Pool Information"
        />
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[
            OutcomeTableValue.Payout,
            OutcomeTableValue.Shares,
            OutcomeTableValue.Outcome,
            OutcomeTableValue.Probability,
          ]}
          outcomeHandleChange={(value: number) => {
            setOutcomeIndex(value)
            setBalanceItem(balances[value])
          }}
          outcomeSelected={outcomeIndex}
          probabilities={probabilities}
        />
        <GridTransactionDetails>
          <div>
            <WalletBalance value={noteAmount} />
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  decimals={collateral.decimals}
                  name="amount"
                  onChange={(e: BigNumberInputReturn) => setAmountShares(e.value)}
                  value={amountShares}
                />
              }
              placeholderText={''}
            />
          </div>
          <div>
            <TransactionDetailsCard>
              <TransactionDetailsRow
                title={'Sell Amount'}
                value={`${formatBigNumber(amountShares, collateral.decimals)}`}
              />
              <TransactionDetailsRow
                emphasizeValue={potentialValue ? potentialValue.gt(0) : false}
                state={ValueStates.success}
                title={'Profit'}
                value={
                  potentialValue
                    ? `${formatBigNumber(potentialValue, collateral.decimals, 2)} ${collateral.symbol}`
                    : '0.00'
                }
              />
              <TransactionDetailsRow
                title={'Trading Fee'}
                value={`${costFee ? formatBigNumber(costFee, collateral.decimals, 2) : '0.00'} ${collateral.symbol}`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={
                  (tradedCollateral && parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0) ||
                  false
                }
                state={
                  (tradedCollateral &&
                    parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0 &&
                    ValueStates.important) ||
                  ValueStates.normal
                }
                title={'Total'}
                value={`${tradedCollateral ? formatBigNumber(tradedCollateral, collateral.decimals, 2) : '0.00'} ${
                  collateral.symbol
                }`}
              />
            </TransactionDetailsCard>
          </div>
        </GridTransactionDetails>
        <ButtonContainer>
          <LeftButton
            buttonType={ButtonType.secondaryLine}
            onClick={() => props.history.push(`/${marketMakerAddress}`)}
          >
            Cancel
          </LeftButton>
          <Button buttonType={ButtonType.secondaryLine} disabled={error} onClick={() => finish()}>
            Sell
          </Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const MarketSell = withRouter(MarketSellWrapper)
