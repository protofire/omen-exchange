import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import { BalanceItem, OutcomeTableValue, Status, Token } from '../../util/types'
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
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [tradedCollateral, setTradedCollateral] = useState<Maybe<BigNumber>>(null)
  const [costFee, setCostFee] = useState<Maybe<BigNumber>>(null)
  const [message, setMessage] = useState<string>('')
  const [pricesAfterTrade, setPricesAfterTrade] = useState<Maybe<number[]>>(null)

  useEffect(() => {
    setBalanceItem(balances[outcomeIndex])

    const holdings = balances.map(balance => balance.holdings)
    const holdingsOfSoldOutcome = holdings[outcomeIndex]
    const holdingsOfOtherOutcomes = holdings.filter((item, index) => {
      return index !== outcomeIndex
    })
    const amountToSell = calcSellAmountInCollateral(
      amountShares,
      holdingsOfSoldOutcome,
      holdingsOfOtherOutcomes,
      0.01,
    )

    if (!amountToSell) {
      setPricesAfterTrade(null)
      setCostFee(null)
      setTradedCollateral(null)
      logger.warn(
        `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
      )
      return
    }

    const balanceAfterTrade = computeBalanceAfterTrade(
      holdings,
      outcomeIndex,
      amountToSell.mul(-1), // negate amounts because it's a sale
      amountShares.mul(-1),
    )

    const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

    setPricesAfterTrade(pricesAfterTrade)
    setCostFee(mulBN(amountToSell, 0.01))
    setTradedCollateral(amountToSell)
  }, [outcomeIndex, amountShares, balances, collateral])

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

      await marketMakerService.sell(tradedCollateral, outcomeIndex)

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
          outcomeSelected={outcomeIndex}
          outcomeHandleChange={(value: number) => setOutcomeIndex(value)}
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
