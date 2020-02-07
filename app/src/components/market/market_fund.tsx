import React, { useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { SectionTitle } from '../common/section_title'
import { divBN, formatBigNumber, formatDate } from '../../util/tools'
import { ViewCard } from '../common/view_card/'
import { Table, TD, TR } from '../common/table'
import { BalanceItem, OutcomeTableValue, Status, Token } from '../../util/types'
import { OutcomeTable } from '../common/outcome_table'
import { Loading } from '../common/loading'
import { SubsectionTitle } from '../common/subsection_title'
import { BigNumberInput, BigNumberInputReturn } from '../common/big_number_input'
import { FormRow } from '../common/form_row'
import { TextfieldCustomPlaceholder } from '../common/textfield_custom_placeholder'
import { ButtonContainer } from '../common/button_container'
import { Button } from '../common/button'
import { getLogger } from '../../util/logger'
import { ERC20Service } from '../../services'
import { useContracts } from '../../hooks/useContracts'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { ButtonLink } from '../common/button_link'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { BalanceToken } from '../common/balance_token'
import { ButtonType } from '../../common/button_styling_types'
import { FormError } from '../common/form_error'
import { FormLabel } from '../common/form_label'
import { useCollateralBalance } from '../../hooks/useCollateralBalance'
import { CPKService } from '../../services/cpk'
import { useFundingBalance } from '../../hooks/useFundingBalance'
import { BalanceShares } from '../common/balance_shares'
import { ToggleTokenLock } from '../common/toggle_token_lock'

interface Props extends RouteComponentProps<any> {
  marketMakerAddress: string
  question: string
  resolution: Maybe<Date>
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  balances: BalanceItem[]
  theme?: any
  collateral: Token
}

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

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const BigNumberInputTextRight = styled<any>(BigNumberInput)`
  text-align: right;
`

const FormLabelStyled = styled(FormLabel)`
  margin-bottom: 10px;
`

const SubsectionTitleStyled = styled(SubsectionTitle)`
  margin-bottom: 0;
`

const logger = getLogger('Market::Fund')

const MarketFundWrapper: React.FC<Props> = (props: Props) => {
  const {
    question,
    resolution,
    totalPoolShares,
    userPoolShares,
    balances,
    marketMakerUserFunding,
    marketMakerFunding,
    marketMakerAddress,
    collateral,
  } = props

  const context = useConnectedWeb3Context()
  const { library: provider, account } = context

  const { buildMarketMaker } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const [amountToFund, setAmountToFund] = useState<BigNumber>(new BigNumber(0))
  const [amountToRemove, setAmountToRemove] = useState<BigNumber>(new BigNumber(0))
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState<string>('')

  const marketMakerFundingPercentage: Maybe<number> = marketMakerFunding.isZero()
    ? null
    : 100 * divBN(marketMakerUserFunding, marketMakerFunding)
  const userPoolSharesPercentage: Maybe<number> = totalPoolShares.isZero()
    ? null
    : 100 * divBN(userPoolShares, totalPoolShares)

  const addFunding = async () => {
    try {
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }

      setStatus(Status.Loading)
      setMessage(
        `Add funding amount: ${formatBigNumber(amountToFund, collateral.decimals)} ${
          collateral.symbol
        } ...`,
      )

      const cpk = await CPKService.create(provider)

      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, account, collateralAddress)

      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
        account,
        cpk.address,
        amountToFund,
      )

      if (!hasEnoughAlowance) {
        await collateralService.approveUnlimited(cpk.address)
      }

      await cpk.addFunding({
        amount: amountToFund,
        collateral,
        marketMaker,
      })

      setStatus(Status.Ready)
      setAmountToFund(new BigNumber(0))
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to add funding: ${err.message}`)
    }
  }

  const removeFunding = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(
        `Remove funding amount: ${formatBigNumber(amountToRemove, collateral.decimals)} shares...`,
      )

      const cpk = await CPKService.create(provider)

      await cpk.removeFunding({
        amount: amountToRemove,
        marketMaker,
      })

      setStatus(Status.Ready)
      setAmountToRemove(new BigNumber(0))
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to remove funding: ${err.message}`)
    }
  }

  const collateralBalance = useCollateralBalance(collateral, context)

  const isFundingToAddGreaterThanBalance = amountToFund.gt(collateralBalance)
  const errorFundingToAdd = amountToFund.isZero() || isFundingToAddGreaterThanBalance

  const fundingToAddMessageError = isFundingToAddGreaterThanBalance
    ? `You don't have enough collateral in your balance.`
    : ''

  const fundingBalance = useFundingBalance(marketMakerAddress, context)

  const isFundingToRemoveGreaterThanFundingBalance = amountToRemove.gt(fundingBalance)
  const errorFundingToRemove = amountToRemove.isZero() || isFundingToRemoveGreaterThanFundingBalance

  const fundingToRemoveMessageError = isFundingToRemoveGreaterThanFundingBalance
    ? `You don't have enough funding in your balance.`
    : ''

  const probabilities = balances.map(balance => balance.probability)

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitleStyled>Fund this market</SubsectionTitleStyled>
        <OutcomeTable
          balances={balances}
          disabledColumns={[OutcomeTableValue.CurrentPrice, OutcomeTableValue.Payout]}
          displayRadioSelection={false}
          collateral={collateral}
          probabilities={probabilities}
        />
        <AmountWrapper
          formField={
            <>
              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInputTextRight
                    decimals={collateral.decimals}
                    name="amountToFund"
                    onChange={(e: BigNumberInputReturn) => setAmountToFund(e.value)}
                    value={amountToFund}
                  />
                }
                placeholderText={collateral.symbol}
              />
              <ToggleTokenLock context={context} amount={amountToFund} collateral={collateral} />
            </>
          }
          title={'Amount to fund'}
          tooltip={{ id: 'amountToFund', description: 'Funds you will add to this market.' }}
          note={
            <>
              <BalanceToken
                collateral={collateral}
                collateralBalance={collateralBalance}
                onClickAddMaxCollateral={() => setAmountToFund(collateralBalance)}
              />
              <FormError>{fundingToAddMessageError}</FormError>
            </>
          }
        />
        <AmountWrapper
          formField={
            <>
              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInputTextRight
                    decimals={collateral.decimals}
                    name="amountToRemove"
                    onChange={(e: BigNumberInputReturn) => setAmountToRemove(e.value)}
                    value={amountToRemove}
                  />
                }
                placeholderText="shares"
              />
            </>
          }
          title={'Amount to remove'}
          tooltip={{ id: 'amountToRemove', description: 'Funds you will remove from this market.' }}
          note={
            <>
              <BalanceShares
                collateral={collateral}
                shares={fundingBalance}
                onClickMax={(shares: BigNumber) => setAmountToRemove(shares)}
              />
              <FormError>{fundingToRemoveMessageError}</FormError>
            </>
          }
        />
        <FormLabelStyled>Totals</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>Total funding</TD>
            <TD textAlign="right">
              {marketMakerFunding ? formatBigNumber(marketMakerFunding, collateral.decimals) : '0'}{' '}
            </TD>
          </TR>
          <TR>
            <TD>Your funding</TD>
            <TD textAlign="right">
              {marketMakerUserFunding
                ? formatBigNumber(marketMakerUserFunding, collateral.decimals)
                : '0'}{' '}
              ({marketMakerFundingPercentage && marketMakerFundingPercentage.toFixed(2)}%){' '}
            </TD>
          </TR>
          <TR>
            <TD>Total pool shares</TD>
            <TD textAlign="right">
              {totalPoolShares ? formatBigNumber(totalPoolShares, collateral.decimals) : '0'}{' '}
              <strong>shares</strong>
            </TD>
          </TR>
          <TR>
            <TD>Your pool shares</TD>
            <TD textAlign="right">
              {userPoolShares ? formatBigNumber(userPoolShares, collateral.decimals) : '0'} (
              {userPoolSharesPercentage && userPoolSharesPercentage.toFixed(2)}%){' '}
              <strong>shares</strong>
            </TD>
          </TR>
        </TableStyled>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.history.push(`/${marketMakerAddress}`)}>
            ‹ Back
          </ButtonLinkStyled>
          <Button
            buttonType={ButtonType.secondary}
            disabled={errorFundingToRemove}
            onClick={() => removeFunding()}
          >
            Remove funds
          </Button>
          <Button
            buttonType={ButtonType.primary}
            onClick={() => addFunding()}
            disabled={errorFundingToAdd}
          >
            Fund
          </Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading ? <Loading message={message} /> : null}
    </>
  )
}

export const MarketFund = withRouter(MarketFundWrapper)
