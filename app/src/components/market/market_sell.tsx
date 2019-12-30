import React, { useState, useMemo } from 'react'
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
  calcSellAmountInCollateral,
  computeBalanceAfterTrade,
  formatBigNumber,
  formatDate,
  mulBN,
} from '../../util/tools'
import { SectionTitle } from '../common/section_title'
import { BalanceShares } from '../common/balance_shares'
import { useContracts } from '../../hooks/useContracts'
import { ButtonType } from '../../common/button_styling_types'
import { Well } from '../common/well'
import { Paragraph } from '../common/paragraph'
import { MARKET_FEE } from '../../common/constants'
import { useAsyncDerivedValue } from '../../hooks/useAsyncDerivedValue'

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

const SubsectionTitleStyled = styled(SubsectionTitle)`
  margin-bottom: 0;
`

const BigNumberInputTextRight = styled<any>(BigNumberInput)`
  text-align: right;
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
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [balanceItem] = useState<BalanceItem>(balances[outcomeIndex])
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')

  const marketFeeWithTwoDecimals = MARKET_FEE / Math.pow(10, 2)

  const calcSellAmount = useMemo(
    () => async (): Promise<[Maybe<number[]>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[outcomeIndex]
      const holdingsOfOtherOutcomes = holdings.filter((item, index) => {
        return index !== outcomeIndex
      })

      const amountToSell = calcSellAmountInCollateral(
        amountShares,
        holdingsOfSoldOutcome,
        holdingsOfOtherOutcomes,
        marketFeeWithTwoDecimals,
      )

      if (!amountToSell) {
        logger.warn(
          `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
        )
        return [null, null, null]
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        holdings,
        outcomeIndex,
        amountToSell.mul(-1), // negate amounts because it's a sale
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const costFee = mulBN(amountToSell, marketFeeWithTwoDecimals)

      return [pricesAfterTrade, costFee, amountToSell]
    },
    [outcomeIndex, balances, amountShares, marketFeeWithTwoDecimals],
  )

  const [pricesAfterTrade, costFee, tradedCollateral] = useAsyncDerivedValue(
    '',
    [null, null, null],
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
      </>
    )
  }

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitleStyled>Choose the shares you want to sell</SubsectionTitleStyled>
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.Payout]}
          outcomeHandleChange={(value: number) => setOutcomeIndex(value)}
          outcomeSelected={outcomeIndex}
          pricesAfterTrade={pricesAfterTrade || undefined /* hack to cast Maybe<A> to A? */}
        />
        <AmountWrapper
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInputTextRight
                  decimals={collateral.decimals}
                  name="amount"
                  onChange={(e: BigNumberInputReturn) => setAmountShares(e.value)}
                  value={amountShares}
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
        <Well>
          <Paragraph>
            • You will be charged an extra {MARKET_FEE}% trade fee of &nbsp;
            <strong>{costFee ? formatBigNumber(costFee, collateral.decimals, 10) : '-'}</strong>
          </Paragraph>
        </Well>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.history.push(`/${marketMakerAddress}`)}>
            ‹ Back
          </ButtonLinkStyled>
          <Button buttonType={ButtonType.primary} disabled={disabled} onClick={() => finish()}>
            Sell
          </Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export const MarketSell = withRouter(MarketSellWrapper)
