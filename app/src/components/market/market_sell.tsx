import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { MARKET_FEE } from '../../common/constants'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useAsyncDerivedValue } from '../../hooks/useAsyncDerivedValue'
import { useContracts } from '../../hooks/useContracts'
import { CPKService, MarketMakerService } from '../../services'
import { ButtonType } from '../../theme/component_styles/button_styling_types'
import { getLogger } from '../../util/logger'
import { calcSellAmountInCollateral, computeBalanceAfterTrade, formatBigNumber, mulBN } from '../../util/tools'
import { BalanceItem, OutcomeTableValue, Status, Token } from '../../util/types'
import {
  BalanceShares,
  BigNumberInput,
  Button,
  ButtonContainer,
  ButtonLink,
  FormError,
  FormLabel,
  FormRow,
  Loading,
  OutcomeTable,
  Paragraph,
  SectionTitle,
  SubsectionTitle,
  TD,
  TR,
  Table,
  TextfieldCustomPlaceholder,
  ViewCard,
  Well,
} from '../common'
import { BigNumberInputReturn } from '../common/big_number_input'

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

  const { balances, collateral, marketMakerAddress, question } = props

  const marketMaker = buildMarketMaker(marketMakerAddress)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(balances[outcomeIndex])
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')

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

  const sharesMessageError = !haveEnoughShares ? `You don't have enough shares in your balance.` : ''

  const note = () => {
    return (
      <>
        <BalanceShares
          collateral={collateral}
          onClickMax={(shares: BigNumber) => {
            setAmountShares(shares)
          }}
          shares={balanceItem.shares}
        />
        <FormError>{sharesMessageError}</FormError>
      </>
    )
  }

  return (
    <>
      <SectionTitle goBackEnabled title={question} />
      <ViewCard>
        <SubsectionTitleStyled>Choose the shares you want to sell</SubsectionTitleStyled>
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.Payout]}
          outcomeHandleChange={(value: number) => {
            setOutcomeIndex(value)
            setBalanceItem(balances[value])
          }}
          outcomeSelected={outcomeIndex}
          probabilities={probabilities}
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
          <ButtonLinkStyled onClick={() => props.history.push(`/${marketMakerAddress}`)}>‹ Back</ButtonLinkStyled>
          <Button buttonType={ButtonType.primary} disabled={error} onClick={() => finish()}>
            Sell
          </Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading ? <Loading full={true} message={message} /> : null}
    </>
  )
}

export const MarketSell = withRouter(MarketSellWrapper)
