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
  DisplayArbitrator,
  GridTransactionDetails,
  GridTwoColumns,
  SectionTitle,
  SubsectionTitle,
  SubsectionTitleAction,
  SubsectionTitleWrapper,
  TextfieldCustomPlaceholder,
  TitleValue,
  TransactionDetailsCard,
  TransactionDetailsLine,
  TransactionDetailsRow,
  ViewCard,
  WalletBalance,
} from '../common'
import { BigNumberInputReturn } from '../common/big_number_input'
import { OutcomeTable } from '../common/outcome_table'
import { ValueStates } from '../common/transaction_details_row'
import { FullLoading } from '../loading'

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
  const [showingExtraInformation, setExtraInformation] = useState(false)

  const toggleExtraInformation = () =>
    showingExtraInformation ? setExtraInformation(false) : setExtraInformation(true)

  const marketFeeWithTwoDecimals = MARKET_FEE / Math.pow(10, 2)

  const calcSellAmount = useMemo(
    () => async (amountShares: BigNumber): Promise<[number[], Maybe<BigNumber>, Maybe<BigNumber>]> => {
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
        return [[], null, null]
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        holdings,
        outcomeIndex,
        amountToSell.mul(-1), // negate amounts because it's a sale
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const costFee = mulBN(amountToSell, marketFeeWithTwoDecimals)

      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)

      return [probabilities, costFee, amountToSell]
    },
    [outcomeIndex, balances, marketFeeWithTwoDecimals],
  )

  const [probabilities, costFee, tradedCollateral] = useAsyncDerivedValue(
    amountShares,
    [balances.map(() => 0), null, null],
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

  const details = (showExtraDetails: boolean) => {
    const mockedDetails = [
      {
        title: 'Total Pool Tokens',
        value: '5000',
      },
      {
        title: 'Total Pool Earning',
        value: '25,232 DAI',
      },
      {
        title: 'My Pool Tokens',
        value: '0',
      },
      {
        title: 'My Earnings',
        value: '0 DAI',
      },

      {
        title: 'Category',
        value: 'Politics',
      },
      {
        title: 'Resolution Date',
        value: '25.09.19 - 09:00',
      },
      {
        title: 'Arbitrator/Oracle',
        value: (
          <DisplayArbitrator
            arbitrator={{ id: 'realitio', address: '0x1234567890', name: 'Realit.io', url: 'https://realit.io/' }}
          />
        ),
      },
      {
        title: '24h Volume',
        value: '425,523 DAI',
      },
    ]
    const mockedDetailsLastHalf = mockedDetails.splice(4, 8)

    return (
      <>
        <GridTwoColumns>
          {showExtraDetails ? (
            <>
              {mockedDetails.map((item, index) => (
                <TitleValue key={index} title={item.title} value={item.value} />
              ))}
            </>
          ) : null}
          {mockedDetailsLastHalf.map((item, index) => (
            <TitleValue key={index} title={item.title} value={item.value} />
          ))}
        </GridTwoColumns>
      </>
    )
  }

  const noteAmount = `${formatBigNumber(balanceItem.shares, collateral.decimals)} shares`

  const mockedPotential = '1.03'
  const mockedSellAmount = '0.00'

  return (
    <>
      <SectionTitle goBackEnabled title={question} />
      <ViewCard>
        <SubsectionTitleWrapper>
          <SubsectionTitle>Choose the shares you want to sell</SubsectionTitle>
          <SubsectionTitleAction onClick={toggleExtraInformation}>
            {showingExtraInformation ? 'Hide' : 'Show'} Pool Information
          </SubsectionTitleAction>
        </SubsectionTitleWrapper>
        {details(showingExtraInformation)}
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.Payout, OutcomeTableValue.Shares]}
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
              <TransactionDetailsRow title={'Sell Amount'} value={`${mockedSellAmount} ${collateral.symbol}`} />
              <TransactionDetailsRow
                emphasizeValue={parseFloat(mockedPotential) > 0}
                state={ValueStates.success}
                title={'Profit'}
                value={`${mockedPotential} ${collateral.symbol}`}
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
