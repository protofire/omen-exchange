import React, { useMemo, useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
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
import { Loading } from '../common/loading'
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
import { FormError } from '../common/form_error'
import { useCollateralBalance } from '../../hooks/useCollateralBalance'
import { ModalTwitterShare } from '../common/modal_twitter_share'
import { CPKService } from '../../services/cpk'

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

const TextLight = styled.span`
  color: ${props => props.theme.colors.textColorLight};
  flex-shrink: 0;
  font-size: 13px;
  font-weight: normal;
  line-height: 1.4;
  text-align: right;
`

const CssText = css`
  font-family: Roboto;
  font-size: 13px;
  color: ${props => props.theme.colors.textColor};
`

const TextBold = styled.span`
  ${CssText}
  font-weight: bold;
`

const TextNormal = styled.span`
  ${CssText}
  font-weight: normal;
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
  const { library: provider } = context

  const { buildMarketMaker } = useContracts(context)

  const { marketMakerAddress, balances, collateral, question, resolution } = props
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')
  const [isModalTwitterShareOpen, setModalTwitterShareState] = useState(false)
  const [messageTwitter, setMessageTwitter] = useState('')

  // get the amount of shares that will be traded and the estimated prices after trade
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[]]> => {
      const tradedShares = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)

      return [tradedShares, probabilities]
    },
    [balances, marketMaker, outcomeIndex],
  )

  const [tradedShares, probabilities] = useAsyncDerivedValue(
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

  const collateralBalance = useCollateralBalance(collateral, context)

  const finish = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(`Buying ${formatBigNumber(tradedShares, collateral.decimals)} shares ...`)

      const signer = provider.getSigner()
      const account = await signer.getAddress()

      const cpk = await CPKService.create(provider)
      const collateralAddress = await marketMaker.getCollateralToken()

      const collateralService = new ERC20Service(provider, account, collateralAddress)
      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
        account,
        cpk.address,
        cost,
      )

      if (!hasEnoughAlowance) {
        await collateralService.approveUnlimited(cpk.address)
      }

      await cpk.buyOutcomes({
        provider,
        cost,
        amount,
        outcomeIndex,
        marketMaker,
      })

      setMessageTwitter(
        `Your outcome was successfully created. You obtain ${formatBigNumber(
          tradedShares,
          collateral.decimals,
        )} shares.`,
      )
      setAmount(new BigNumber(0))
      setStatus(Status.Ready)

      setModalTwitterShareState(true)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to buy: ${err.message}`)
    }
  }

  const isBuyAmountGreaterThanBalance = amount.gt(collateralBalance)

  const buyMessageError = isBuyAmountGreaterThanBalance
    ? `You don't have enough collateral in your balance.`
    : ''

  const error =
    (status !== Status.Ready && status !== Status.Error) ||
    cost.isZero() ||
    isBuyAmountGreaterThanBalance ||
    amount.isZero()

  const noteAmount = (
    <>
      <BalanceToken
        collateral={collateral}
        collateralBalance={collateralBalance}
        onClickAddMaxCollateral={() => setAmount(collateralBalance)}
      />
      <FormError>{buyMessageError}</FormError>
    </>
  )

  const amountFee = cost.sub(amount)

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitleStyled>Choose the shares you want to buy</SubsectionTitleStyled>
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          probabilities={probabilities}
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
          title={'Total cost'}
          tooltip={{ id: 'amount', description: 'Shares to buy with this amount of collateral.' }}
        />
        <FormLabelStyled>Transaction details</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>
              <TextLight>Trading Fee</TextLight>
            </TD>
            <TD textAlign="right">
              <TextNormal>{formatBigNumber(amountFee.mul(-1), collateral.decimals)}</TextNormal>{' '}
              <TextLight>{collateral.symbol}</TextLight>
            </TD>
          </TR>
          <TR>
            <TD>
              <TextLight>Base Cost</TextLight>
            </TD>
            <TD textAlign="right">
              <TextNormal>{formatBigNumber(amount.sub(amountFee), collateral.decimals)}</TextNormal>{' '}
              <TextLight>{collateral.symbol}</TextLight>
            </TD>
          </TR>
          <TR>
            <TD withBorder={false}>
              <TextLight>You will receive</TextLight>
            </TD>
            <TD textAlign="right" withBorder={false}>
              <TextBold>{formatBigNumber(tradedShares, collateral.decimals)} </TextBold>{' '}
              <TextLight>
                <strong>Shares</strong>
              </TextLight>
            </TD>
          </TR>
        </TableStyled>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.history.push(`/${marketMakerAddress}`)}>
            ‹ Back
          </ButtonLinkStyled>
          <Button buttonType={ButtonType.primary} disabled={error} onClick={() => finish()}>
            Buy
          </Button>
        </ButtonContainer>
      </ViewCard>
      <ModalTwitterShare
        title={'Outcome created'}
        description={messageTwitter}
        shareUrl={`${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`}
        isOpen={isModalTwitterShareOpen}
        onClose={() => setModalTwitterShareState(false)}
      />
      {status === Status.Loading ? <Loading message={message} full={true} /> : null}
    </>
  )
}

export const MarketBuy = withRouter(MarketBuyWrapper)
