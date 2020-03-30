import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { useCollateralBalance } from '../../../../hooks'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { BalanceState, fetchAccountBalance } from '../../../../store/reducer'
import { MarketCreationStatus } from '../../../../util/market_creation_status_data'
import { formatBigNumber, formatDate } from '../../../../util/tools'
import { Arbitrator, Token } from '../../../../util/types'
import { Button, ButtonContainer, ButtonLink } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import {
  BalanceToken,
  BigNumberInput,
  CreateCard,
  DisplayArbitrator,
  FormError,
  FormRow,
  Paragraph,
  SubsectionTitle,
  TD,
  TH,
  THead,
  TR,
  Table,
  Textfield,
  TextfieldCustomPlaceholder,
  TitleValue,
  Tokens,
  Well,
} from '../../../common'
import { BigNumberInputReturn } from '../../../common/big_number_input'
import { FullLoading } from '../../../loading'
import { Outcome } from '../../outcomes'

interface Props {
  back: () => void
  submit: () => void
  values: {
    collateral: Token
    question: string
    category: string
    resolution: Date | null
    arbitrator: Arbitrator
    spread: number
    funding: BigNumber
    outcomes: Outcome[]
  }
  marketCreationStatus: MarketCreationStatus
  handleCollateralChange: (collateral: Token) => void
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | BigNumberInputReturn) => any
}

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const TextfieldStyledRight = styled<any>(Textfield)`
  text-align: right;
`

const BigNumberInputTextRight = styled<any>(BigNumberInput)`
  text-align: right;
`

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ErrorStyled = styled(FormError)`
  margin: 0 0 10px 0;
`

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 14px;
`

const TitleValueStyled = styled(TitleValue)`
  margin-bottom: 14px;
`

const TitleValueFinalStyled = styled(TitleValue)`
  margin-bottom: 25px;
`

const SubsectionTitleNoMargin = styled(SubsectionTitle)`
  margin-bottom: 0;
`

const FundingAndFeeStep = (props: Props) => {
  const context = useConnectedWeb3Context()
  const balance = useSelector((state: BalanceState): Maybe<BigNumber> => state.balance && new BigNumber(state.balance))
  const dispatch = useDispatch()
  const { account, library: provider } = context

  const { handleChange, handleCollateralChange, marketCreationStatus, submit, values } = props
  const { arbitrator, category, collateral, funding, outcomes, question, resolution, spread } = values

  React.useEffect(() => {
    dispatch(fetchAccountBalance(account, provider, collateral))
  }, [dispatch, account, provider, collateral])

  const collateralBalance = useCollateralBalance(collateral, context)

  const isFundingGreaterThanBalance = account ? funding.gt(collateralBalance) : false
  const error = !spread || funding.isZero() || isFundingGreaterThanBalance

  const fundingMessageError = isFundingGreaterThanBalance ? `You don't have enough collateral in your balance.` : ''
  const resolutionDate = resolution && formatDate(resolution)

  const back = () => {
    props.back()
  }

  const hasEnoughBalance = balance && balance.gte(funding)
  let fundingErrorMessage = ''
  if (balance && !hasEnoughBalance) {
    fundingErrorMessage = `You entered ${formatBigNumber(funding, collateral.decimals)} ${
      collateral.symbol
    } of funding but your account only has ${formatBigNumber(balance, collateral.decimals)} ${collateral.symbol}`
  }

  return (
    <>
      <CreateCard>
        <OutcomeInfo>
          <Paragraph>
            Please <strong>check all the information is correct</strong>. You can go back and edit anything you need.
          </Paragraph>
          <Paragraph>
            <strong>If everything is OK</strong> proceed to create the new market.
          </Paragraph>
        </OutcomeInfo>

        <SubsectionTitle>Details</SubsectionTitle>
        <TitleValueStyled title={'Question'} value={question} />
        <Grid>
          <TitleValue title={'Category'} value={category} />
          <TitleValue title={'Resolution date'} value={resolutionDate} />
          <TitleValue title={'Spread / Fee'} value={`${spread}%`} />
          {collateral && (
            <TitleValue
              title={'Funding'}
              value={[formatBigNumber(funding, collateral.decimals), <strong key="1"> {collateral.symbol}</strong>]}
            />
          )}
        </Grid>
        <TitleValueFinalStyled title={'Arbitrator'} value={<DisplayArbitrator arbitrator={arbitrator} />} />
        <SubsectionTitleNoMargin>Outcomes</SubsectionTitleNoMargin>
        <Table
          head={
            <THead>
              <TR>
                <TH>Outcome</TH>
                <TH textAlign="right">Probabilities</TH>
              </TR>
            </THead>
          }
          maxHeight="130px"
        >
          {outcomes.map((outcome, index) => {
            return (
              <TR key={index}>
                <TD>{outcome.name}</TD>
                <TD textAlign="right">{outcome.probability}%</TD>
              </TR>
            )
          })}
        </Table>
      </CreateCard>
      <CreateCard>
        <FormRow
          formField={
            <TextfieldCustomPlaceholder
              disabled={true}
              formField={
                <TextfieldStyledRight
                  defaultValue={spread}
                  disabled
                  name="spread"
                  onChange={handleChange}
                  type="number"
                />
              }
              placeholderText="%"
            />
          }
          title={'Spread / Fee'}
        />
        <FormRow
          formField={
            <Tokens context={context} name="collateralId" onTokenChange={handleCollateralChange} value={collateral} />
          }
          title={'Collateral token'}
        />
        <FormRow
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInputTextRight
                  decimals={collateral.decimals}
                  name="funding"
                  onChange={handleChange}
                  value={funding}
                />
              }
              placeholderText={collateral.symbol}
            />
          }
          note={
            <>
              {account && (
                <BalanceToken
                  collateral={collateral}
                  collateralBalance={collateralBalance}
                  onClickAddMaxCollateral={() => handleChange({ name: 'funding', value: collateralBalance })}
                />
              )}
              <FormError>{fundingMessageError}</FormError>
            </>
          }
          title={'Funding'}
        />
        {!MarketCreationStatus.is.ready(marketCreationStatus) &&
        !MarketCreationStatus.is.error(marketCreationStatus) ? (
          <FullLoading message={`${marketCreationStatus._type}...`} />
        ) : null}

        {fundingErrorMessage && <ErrorStyled>{fundingErrorMessage}</ErrorStyled>}

        <ButtonContainer>
          <ButtonLinkStyled
            disabled={
              !MarketCreationStatus.is.ready(marketCreationStatus) &&
              !MarketCreationStatus.is.error(marketCreationStatus)
            }
            onClick={back}
          >
            ‹ Back
          </ButtonLinkStyled>
          {account ? (
            <Button
              buttonType={ButtonType.primary}
              disabled={
                !MarketCreationStatus.is.ready(marketCreationStatus) ||
                MarketCreationStatus.is.error(marketCreationStatus) ||
                !hasEnoughBalance ||
                error
              }
              onClick={submit}
            >
              Create
            </Button>
          ) : (
            <Button buttonType={ButtonType.primary} onClick={submit}>
              Connect Wallet
            </Button>
          )}
        </ButtonContainer>
      </CreateCard>
    </>
  )
}

export { FundingAndFeeStep }
