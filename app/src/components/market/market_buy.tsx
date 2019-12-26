import React, { useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import { BalanceItem, Status, OutcomeTableValue, Token } from '../../util/types'
import { Button, BigNumberInput, OutcomeTable } from '../common'
import { ERC20Service, MarketMakerService } from '../../services'
import { SubsectionTitle } from '../common/subsection_title'
import { Table, TD, TR } from '../common/table'
import { ViewCard } from '../common/view_card'
import { computeBalanceAfterTrade, formatBigNumber, formatDate } from '../../util/tools'
import { getLogger } from '../../util/logger'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useAsyncDerivedValue } from '../../hooks/useAsyncDerivedValue'
import { Well } from '../common/well'
import { Paragraph } from '../common/paragraph'
import { FullLoading } from '../common/full_loading'
import { ButtonContainer } from '../common/button_container'
import { ButtonLink } from '../common/button_link'
import { FormRow } from '../common/form_row'
import { FormLabel } from '../common/form_label'
import { TextfieldCustomPlaceholder } from '../common/textfield_custom_placeholder'
import { BigNumberInputReturn } from '../common/big_number_input'
import { SectionTitle } from '../common/section_title'
import { BalanceToken } from '../common/balance_token'
import { useContracts } from '../../hooks/useContracts'
import { ButtonType } from '../../common/button_styling_types'
import { MARKET_FEE } from '../../common/constants'

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

const logger = getLogger('Market::Buy')

interface Props extends RouteComponentProps<any> {
  marketMakerAddress: string
  balances: BalanceItem[]
  collateral: Token
  question: string
  resolution: Maybe<Date>
}

const MarketBuyWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { buildMarketMaker } = useContracts(context)

  const { marketMakerAddress, balances, collateral, question, resolution } = props
  const marketMakerService = buildMarketMaker(marketMakerAddress)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')

  // get the amount of shares that will be traded and the estimated prices after trade
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[]]> => {
      const tradedShares = await marketMakerService.calcBuyAmount(amount, outcomeIndex)
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      return [tradedShares, pricesAfterTrade]
    },
    [balances, marketMakerService, outcomeIndex],
  )

  const [tradedShares, pricesAfterTrade] = useAsyncDerivedValue(
    amount,
    [new BigNumber(0), balances.map(() => 0)],
    calcBuyAmount,
  )

  useEffect(() => {
    const valueNumber = +ethers.utils.formatUnits(amount, collateral.decimals)

    const weiPerUnit = ethers.utils.bigNumberify(10).pow(collateral.decimals)
    const marketFeeWithTwoDecimals = MARKET_FEE / Math.pow(10, 2)
    const costWithFee = ethers.utils
      .bigNumberify('' + Math.round(valueNumber * (1 + marketFeeWithTwoDecimals) * 10000)) // cast to string to avoid overflows
      .mul(weiPerUnit)
      .div(10000)
    setCost(costWithFee)
  }, [amount, collateral])

  const finish = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(`Buying ${formatBigNumber(tradedShares, collateral.decimals)} shares ...`)

      const provider = context.library
      const user = await provider.getSigner().getAddress()

      const collateralAddress = await marketMakerService.getCollateralToken()

      const collateralService = new ERC20Service(provider, collateralAddress)

      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
        user,
        marketMakerAddress,
        cost,
      )

      if (!hasEnoughAlowance) {
        // add 10% to the approved amount because there can be precision errors
        // this can be improved if, instead of adding the 1% fee manually in the front, we use the `calcMarketFee`
        // contract method and add it to the result of `calcNetCost` result
        const costWithErrorMargin = cost.mul(11000).div(10000)
        await collateralService.approve(marketMakerAddress, costWithErrorMargin)
      }

      await marketMakerService.buy(amount, outcomeIndex)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to buy: ${err.message}`)
    }
  }

  const disabled = (status !== Status.Ready && status !== Status.Error) || cost.isZero()

  const noteAmount = (
    <>
      <BalanceToken
        collateral={collateral}
        onClickMax={(collateral: Token, collateralBalance: BigNumber) =>
          setAmount(collateralBalance)
        }
      />
    </>
  )

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitleStyled>Choose the shares you want to buy</SubsectionTitleStyled>
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          pricesAfterTrade={pricesAfterTrade}
          outcomeSelected={outcomeIndex}
          outcomeHandleChange={(value: number) => setOutcomeIndex(value)}
          disabledColumns={[OutcomeTableValue.Payout]}
        />
        <AmountWrapper
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInputTextRight
                  name="amount"
                  value={amount}
                  onChange={(e: BigNumberInputReturn) => setAmount(e.value)}
                  decimals={collateral.decimals}
                />
              }
              placeholderText={collateral.symbol}
            />
          }
          note={noteAmount}
          title={'Amount'}
          tooltip={{ id: 'amount', description: 'Shares to buy with this amount of collateral.' }}
        />
        <FormLabelStyled>Totals</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>You spend</TD>
            <TD textAlign="right">
              {formatBigNumber(cost, collateral.decimals)} <strong>{collateral.symbol}</strong>
            </TD>
          </TR>
          <TR>
            <TD>&quot;{balances[outcomeIndex].outcomeName}&quot; shares you get</TD>
            <TD textAlign="right">
              {formatBigNumber(tradedShares, collateral.decimals)} <strong>shares</strong>
            </TD>
          </TR>
        </TableStyled>
        <Well>
          <Paragraph>
            • <strong>1 shares</strong> can be redeemed for <strong>1 {collateral.symbol}</strong>{' '}
            in case it represents the final outcome.
          </Paragraph>
          <Paragraph>
            • You will be charged an extra {MARKET_FEE}% trade fee of &nbsp;
            <strong>
              {cost.isZero() ? '0' : formatBigNumber(cost.sub(amount), collateral.decimals)}{' '}
              {collateral.symbol}
            </strong>
          </Paragraph>
        </Well>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.history.push(`/${marketMakerAddress}`)}>
            ‹ Back
          </ButtonLinkStyled>
          <Button buttonType={ButtonType.primary} disabled={disabled} onClick={() => finish()}>
            Buy
          </Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export const MarketBuy = withRouter(MarketBuyWrapper)
