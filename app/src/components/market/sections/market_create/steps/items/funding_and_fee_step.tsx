import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { IS_CORONA_VERSION } from '../../../../../../common/constants'
import { useCollateralBalance } from '../../../../../../hooks'
import { useConnectedWeb3Context } from '../../../../../../hooks/connectedWeb3'
import { BalanceState, fetchAccountBalance } from '../../../../../../store/reducer'
import { MarketCreationStatus } from '../../../../../../util/market_creation_status_data'
import { formatBigNumber, formatDate } from '../../../../../../util/tools'
import { Arbitrator, Token } from '../../../../../../util/types'
import { Button } from '../../../../../button'
import { ButtonType } from '../../../../../button/button_styling_types'
import { BigNumberInput, FormError, SubsectionTitle, TextfieldCustomPlaceholder } from '../../../../../common'
import { BigNumberInputReturn } from '../../../../../common/form/big_number_input'
import { TitleValue } from '../../../../../common/text/title_value'
import { FullLoading } from '../../../../../loading'
import { CreateCard } from '../../../../common/create_card'
import { CurrencySelector } from '../../../../common/currency_selector'
import { DisplayArbitrator } from '../../../../common/display_arbitrator'
import { GridTransactionDetails } from '../../../../common/grid_transaction_details'
import { NewValue } from '../../../../common/new_value'
import { TransactionDetailsCard } from '../../../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../../../common/transaction_details_row'
import { WalletBalance } from '../../../../common/wallet_balance'
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
  TDFlexDiv,
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

const SubTitle = styled.h3`
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
  justify-content: flex-start;

  > h2 {
    margin: 0 0 6px;
  }

  > p {
    text-align: left;
  }
`

const CurrenciesWrapper = styled.div`
  margin-bottom: 12px;
`

const GridTransactionDetailsStyled = styled(GridTransactionDetails)`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  padding-top: 20px;
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
  const error = funding.isZero() || isFundingGreaterThanBalance

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
      <CreateCardTop>
        <SubsectionTitleStyled>Your Market</SubsectionTitleStyled>
        <SubTitle>Market Question</SubTitle>
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
                    <OutcomesTD textAlign="right">
                      <TDFlexDiv textAlign="right">
                        0 <NewValue outcomeIndex={index} value="2.35" />
                      </TDFlexDiv>
                    </OutcomesTD>
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
      <CreateCardBottom>
        <SubsectionTitleStyled>Fund Market</SubsectionTitleStyled>
        <CurrenciesWrapper>
          <SubTitle style={{ marginBottom: '14px' }}>Choose Currency</SubTitle>
          <CurrencySelector
            context={context}
            disabled={IS_CORONA_VERSION}
            onSelect={handleCollateralChange}
            selectedCurrency={collateral}
          />
        </CurrenciesWrapper>
        <GridTransactionDetailsStyled>
          <div>
            <WalletBalance value={formatBigNumber(collateralBalance, collateral.decimals)} />
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput decimals={collateral.decimals} name="funding" onChange={handleChange} value={funding} />
              }
              placeholderText={collateral.symbol}
            />
          </div>
          <div>
            <TransactionDetailsCard>
              <TransactionDetailsRow state={ValueStates.important} title={'Earn Trading Fee'} value={`${spread}%`} />
              <TransactionDetailsLine />
              <TransactionDetailsRow title={'Pool Tokens'} value={formatBigNumber(funding, collateral.decimals)} />
            </TransactionDetailsCard>
          </div>
        </GridTransactionDetailsStyled>
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
      {!MarketCreationStatus.is.ready(marketCreationStatus) && !MarketCreationStatus.is.error(marketCreationStatus) ? (
        <FullLoading message={`${marketCreationStatus._type}...`} />
      ) : null}
    </>
  )
}

export { FundingAndFeeStep }
