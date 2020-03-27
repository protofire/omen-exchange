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
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import {
  BalanceToken,
  BigNumberInput,
  CreateCard,
  DisplayArbitrator,
  FormError,
  FormRow,
  SubsectionTitle,
  Textfield,
  TextfieldCustomPlaceholder,
  TitleValue,
  Tokens,
} from '../../../common'
import { BigNumberInputReturn } from '../../../common/big_number_input'
import { FullLoading } from '../../../loading'
import {
  ButtonContainerFullWidth,
  ButtonWithReadyToGoStatus,
  LeftButton,
  OutcomeItemLittleBallOfJoyAndDifferentColors,
  OutcomeItemText,
  OutcomeItemTextWrapper,
  OutcomesTBody,
  OutcomesTD,
  OutcomesTH,
  OutcomesTHead,
  OutcomesTR,
  OutcomesTable,
  OutcomesTableWrapper,
} from '../common_styled'
import { Outcome } from '../outcomes'

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

const CreateCardTop = styled(CreateCard)`
  margin-bottom: 20px;
  min-height: 0;
`

const CreateCardBottom = styled(CreateCard)`
  min-height: 0;
`

const SubsectionTitleStyled = styled(SubsectionTitle)`
  margin-bottom: 20px;
`

const QuestionTitle = styled.h3`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 14px;
  font-weight: normal;
  margin: 0 0 6px;
`

const QuestionText = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: normal;
  margin: 0 0 20px;
`

const TextfieldStyledRight = styled<any>(Textfield)`
  text-align: right;
`

const BigNumberInputTextRight = styled<any>(BigNumberInput)`
  text-align: right;
`

const Grid = styled.div`
  display: grid;
  grid-column-gap: 50px;
  grid-row-gap: 20px;
  grid-template-columns: 1fr;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const TitleValueVertical = styled(TitleValue)`
  flex-direction: column;

  > h2 {
    margin: 0 0 6px;
  }
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
    fundingErrorMessage = `You entered ${formatBigNumber(
      funding,
      collateral.decimals,
    )} DAI of funding but your account only has ${formatBigNumber(balance, collateral.decimals)} DAI`
  }

  return (
    <>
      <CreateCardTop>
        <SubsectionTitleStyled>Your Market</SubsectionTitleStyled>
        <QuestionTitle>Market Question</QuestionTitle>
        <QuestionText>{question}</QuestionText>
        <OutcomesTableWrapper>
          <OutcomesTable>
            <OutcomesTHead>
              <OutcomesTR>
                <OutcomesTH>Outcome</OutcomesTH>
                <OutcomesTH textAlign="right">Probability</OutcomesTH>
                <OutcomesTH textAlign="right">My Shares</OutcomesTH>
              </OutcomesTR>
            </OutcomesTHead>
            <OutcomesTBody>
              {outcomes.map((outcome, index) => {
                return (
                  <OutcomesTR key={index}>
                    <OutcomesTD>
                      <OutcomeItemTextWrapper>
                        <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={index} />
                        <OutcomeItemText>{outcome.name}</OutcomeItemText>
                      </OutcomeItemTextWrapper>
                    </OutcomesTD>
                    <OutcomesTD textAlign="right">{outcome.probability}%</OutcomesTD>
                    <OutcomesTD textAlign="right">0</OutcomesTD>
                  </OutcomesTR>
                )
              })}
            </OutcomesTBody>
          </OutcomesTable>
        </OutcomesTableWrapper>
        <Grid>
          <TitleValueVertical title={'Category'} value={category} />
          <TitleValueVertical title={'Resolution date'} value={resolutionDate} />
          <TitleValueVertical title={'Arbitrator'} value={<DisplayArbitrator arbitrator={arbitrator} />} />
        </Grid>
      </CreateCardTop>
      {/* {collateral && (
            <TitleValue
              title={'Funding'}
              value={[formatBigNumber(funding, collateral.decimals), <strong key="1"> {collateral.symbol}</strong>]}
            />
          )} */}
      {/* <TitleValue title={'Spread / Fee'} value={`${spread}%`} /> */}
      <CreateCardBottom>
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
        {fundingErrorMessage && <FormError>{fundingErrorMessage}</FormError>}
        <ButtonContainerFullWidth>
          <LeftButton
            buttonType={ButtonType.secondaryLine}
            disabled={
              !MarketCreationStatus.is.ready(marketCreationStatus) &&
              !MarketCreationStatus.is.error(marketCreationStatus)
            }
            onClick={back}
          >
            Back
          </LeftButton>
          {!account && (
            <Button buttonType={ButtonType.primary} onClick={submit}>
              Connect Wallet
            </Button>
          )}
          <ButtonWithReadyToGoStatus
            buttonType={ButtonType.primary}
            disabled={
              !MarketCreationStatus.is.ready(marketCreationStatus) ||
              MarketCreationStatus.is.error(marketCreationStatus) ||
              !hasEnoughBalance ||
              error ||
              !account
            }
            onClick={submit}
            readyToGo={
              !(
                !MarketCreationStatus.is.ready(marketCreationStatus) ||
                MarketCreationStatus.is.error(marketCreationStatus) ||
                !hasEnoughBalance ||
                error ||
                !account
              )
            }
          >
            Create Market
          </ButtonWithReadyToGoStatus>
        </ButtonContainerFullWidth>
      </CreateCardBottom>
    </>
  )
}

export { FundingAndFeeStep }
