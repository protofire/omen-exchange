import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import { BalanceItem, OutcomeSlot, OutcomeTableValue, Status, Token } from '../../util/types'
import { Button, BigNumberInput, OutcomeTable } from '../common'
import { ButtonContainer } from '../common/button_container'
import { ButtonLink } from '../common/button_link'
import { FormLabel } from '../common/form_label'
import { FormRow } from '../common/form_row'
import { SubsectionTitle } from '../common/subsection_title'
import { Table, TD, TR } from '../common/table'
import { TextfieldCustomPlaceholder } from '../common/textfield_custom_placeholder'
import { ViewCard } from '../common/view_card'
import { MarketMakerService } from '../../services'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { getLogger } from '../../util/logger'
import { BigNumberInputReturn } from '../common/big_number_input'
import { FullLoading } from '../common/full_loading'
import {
  computeBalanceAfterTrade,
  formatBigNumber,
  formatDate,
  calcSellAmountInCollateral,
  mulBN,
} from '../../util/tools'
import { SectionTitle } from '../common/section_title'
import { BalanceShares } from '../common/balance_shares'
import { useContracts } from '../../hooks/useContracts'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const TableStyled = styled(Table)`
  margin-bottom: 30px;
`

const AmountWrapper = styled(FormRow)`
  margin-bottom: 30px;
  width: 100%;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 50%;
  }
`

const FormLabelStyled = styled(FormLabel)`
  margin-bottom: 10px;
`
const logger = getLogger('Market::Sell')

interface Props extends RouteComponentProps<any> {
  marketMakerAddress: string
  balances: BalanceItem[]
  collateral: Token
  question: string
  resolution: Maybe<Date>
}

const MarketSellWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { buildMarketMaker, conditionalTokens } = useContracts(context)

  const { balances, marketMakerAddress, collateral, question, resolution } = props

  const marketMakerService = buildMarketMaker(marketMakerAddress)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>()
  const [outcome, setOutcome] = useState<OutcomeSlot>(OutcomeSlot.Yes)
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [tradedCollateral, setTradedCollateral] = useState<Maybe<BigNumber>>(null)
  const [costFee, setCostFee] = useState<Maybe<BigNumber>>(null)
  const [message, setMessage] = useState<string>('')
  const [pricesAfterTrade, setPricesAfterTrade] = useState<Maybe<[number, number]>>(null)

  // TODO: refactor this
  const holdingsYes = balances[0].holdings
  const holdingsNo = balances[1].holdings

  useEffect(() => {
    const balanceItemFound: BalanceItem | undefined = balances.find((balanceItem: BalanceItem) => {
      return balanceItem.outcomeName === outcome
    })
    setBalanceItem(balanceItemFound)

    // TODO: refactor this
    const yesHoldings = balances[0].holdings
    const noHoldings = balances[1].holdings
    const [holdingsOfSoldOutcome, holdingsOfOtherOutcome] =
      outcome === OutcomeSlot.Yes ? [yesHoldings, noHoldings] : [noHoldings, yesHoldings]
    const amountToSell = calcSellAmountInCollateral(
      amountShares,
      holdingsOfSoldOutcome,
      [holdingsOfOtherOutcome],
      0.01,
    )

    if (!amountToSell) {
      setPricesAfterTrade(null)
      setCostFee(null)
      setTradedCollateral(null)
      logger.warn(
        `Could not compute amount of collateral to sell for '${amountShares.toString()}', '${holdingsOfSoldOutcome.toString()}' and '${holdingsOfOtherOutcome.toString()}'`,
      )
      return
    }

    const balanceAfterTrade = computeBalanceAfterTrade(
      holdingsYes,
      holdingsNo,
      outcome,
      amountToSell.mul(-1), // negate amounts because it's a sale
      amountShares.mul(-1),
    )
    // TODO: refactor this with multiple outcomes
    const { actualPriceForYes, actualPriceForNo } = MarketMakerService.getActualPrice(
      balanceAfterTrade,
    )

    setPricesAfterTrade([actualPriceForYes, actualPriceForNo])
    setCostFee(mulBN(amountToSell, 0.01))
    setTradedCollateral(amountToSell)
  }, [outcome, amountShares, balances, collateral, holdingsYes, holdingsNo])

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

      const isApprovedForAll = await conditionalTokens.isApprovedForAll(marketMakerAddress)
      if (!isApprovedForAll) {
        await conditionalTokens.setApprovalForAll(marketMakerAddress)
      }

      await marketMakerService.sell(tradedCollateral, outcome)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to sell: ${err.message}`)
    }
  }

  const disabled =
    (status !== Status.Ready && status !== Status.Error) ||
    amountShares.isZero() ||
    !haveEnoughShares

  const note = () => {
    return (
      <>
        <BalanceShares
          balanceItem={balanceItem}
          collateral={collateral}
          onClickMax={(balanceItemSet?: BalanceItem) => {
            if (balanceItemSet) setAmountShares(balanceItemSet.shares)
          }}
        />
        You will be charged an extra 1% trade fee of &nbsp;
        <strong>{costFee ? formatBigNumber(costFee, collateral.decimals, 10) : '-'}</strong>
      </>
    )
  }

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitle>Choose the shares you want to sell</SubsectionTitle>
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          pricesAfterTrade={pricesAfterTrade || undefined /* hack to cast Maybe<A> to A? */}
          outcomeSelected={outcome}
          outcomeHandleChange={(value: OutcomeSlot) => setOutcome(value)}
          disabledColumns={[OutcomeTableValue.Payout]}
        />
        <AmountWrapper
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  name="amount"
                  value={amountShares}
                  onChange={(e: BigNumberInputReturn) => setAmountShares(e.value)}
                  decimals={collateral.decimals}
                />
              }
              placeholderText="Shares"
            />
          }
          note={note()}
          title={'Amount'}
          tooltip={{ id: 'amount', description: 'Amount of shares to sell.' }}
        />
        <FormLabelStyled>Totals</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>Total {collateral.symbol} Return</TD>
            <TD textAlign="right">
              {tradedCollateral ? formatBigNumber(tradedCollateral, collateral.decimals) : '-'}{' '}
              <strong>{collateral.symbol}</strong>
            </TD>
          </TR>
        </TableStyled>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.history.push(`/${marketMakerAddress}`)}>
            ‹ Back
          </ButtonLinkStyled>
          <Button disabled={disabled} onClick={() => finish()}>
            Finish
          </Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export const MarketSell = withRouter(MarketSellWrapper)
