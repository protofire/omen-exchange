import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import {
  DEFAULT_TOKEN_ADDRESS,
  DEFAULT_TOKEN_ADDRESS_RINKEBY,
  DOCUMENT_FAQ,
  MAX_MARKET_FEE,
} from '../../../../../../common/constants'
import {
  useCollateralBalance,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useCpkAllowance,
} from '../../../../../../hooks'
import { useGraphMarketsFromQuestion } from '../../../../../../hooks/useGraphMarketsFromQuestion'
import { BalanceState, fetchAccountBalance } from '../../../../../../store/reducer'
import { MarketCreationStatus } from '../../../../../../util/market_creation_status_data'
import { RemoteData } from '../../../../../../util/remote_data'
import { formatBigNumber, formatDate, formatNumber } from '../../../../../../util/tools'
import { Arbitrator, CompoundEnabledTokenType, Ternary, Token } from '../../../../../../util/types'
import { Button } from '../../../../../button'
import { ButtonType } from '../../../../../button/button_styling_types'
import { BigNumberInput, SubsectionTitle, TextfieldCustomPlaceholder } from '../../../../../common'
import { BigNumberInputReturn } from '../../../../../common/form/big_number_input'
import { TitleValue } from '../../../../../common/text/title_value'
import { FullLoading } from '../../../../../loading'
import { AddCompoundService } from '../../../../common/add_compound_service'
import {
  ButtonContainerFullWidth,
  CurrenciesWrapper,
  GenericError,
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
} from '../../../../common/common_styled'
import { CreateCard } from '../../../../common/create_card'
import { CurrencySelector } from '../../../../common/currency_selector'
import { DisplayArbitrator } from '../../../../common/display_arbitrator'
import { GridTransactionDetails } from '../../../../common/grid_transaction_details'
import { SetAllowance } from '../../../../common/set_allowance'
import { TradingFeeSelector } from '../../../../common/trading_fee_selector'
import { TransactionDetailsCard } from '../../../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../../../common/transaction_details_row'
import { VerifiedRow } from '../../../../common/verified_row'
import { WarningMessage } from '../../../../common/warning_message'
import { Outcome } from '../outcomes'

const CreateCardTop = styled(CreateCard)`
  margin-bottom: 20px;
  min-height: 0;
  padding: 24px;
`

const CreateCardBottom = styled(CreateCard)`
  min-height: 0;
`

const SubsectionTitleStyled = styled(SubsectionTitle)`
  margin-bottom: 24px;
`

const LeftButton = styled(Button as any)`
  margin-right: auto;
`

const SubTitle = styled.h3`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 14px;
  font-weight: normal;
  margin: 0 0 8px;
`

const QuestionText = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: normal;
  margin: 0 0 24px;
`

const TitleValueVertical = styled(TitleValue)`
  flex-direction: column;
  justify-content: flex-start;
  text-transform: capitalize;

  > h2 {
    margin: 0 0 6px;
  }

  > p {
    text-align: left;
  }
`

const GridTransactionDetailsWrapper = styled(GridTransactionDetails)<{ noMarginTop: boolean }>`
  ${props => (props.noMarginTop ? 'margin-top: 0;' : '')};
`

const CreateCardBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CustomFeeToggle = styled.p`
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  margin-top: 0;

  &:hover {
    text-decoration: underline;
  }
`

const CustomFeeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 0 0;
`

const CustomFeeLabel = styled.p`
  width: 50%;
  margin: 0;
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  line-height: 16px;
`

const StyledTradingFeeSelector = styled(TradingFeeSelector)`
  width: 50%;
  .dropdownItems {
    min-width: auto;
  }
`

const FlexRowWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  & > * + * {
    margin-left: 48px;
  }
`

const StyledButtonContainerFullWidth = styled(ButtonContainerFullWidth as any)`
  padding: 24px;
  padding-bottom: 0;
  margin: 0 -24px;
  margin-bottom: -1px;
`

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
    loadedQuestionId: Maybe<string>
    verifyLabel?: string
    userInputCollateral: Token
  }
  marketCreationStatus: MarketCreationStatus
  compoundInterestRate: string
  handleCollateralChange: (userInputCollateral: Token) => void
  handleTradingFeeChange: (fee: string) => void
  setCompoundInterestRate: (userInputCollateral: Token) => void
  handleUseCompoundReserveChange: (useCompoundReserve: boolean) => void
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | BigNumberInputReturn) => any
  resetTradingFee: () => void
}

const FundingAndFeeStep: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()
  const balance = useSelector((state: BalanceState): Maybe<BigNumber> => state.balance && new BigNumber(state.balance))
  const dispatch = useDispatch()
  const { account, library: provider } = context
  const signer = useMemo(() => provider.getSigner(), [provider])
  const [isServiceChecked, setServiceCheck] = useState<boolean>(false)
  const {
    back,
    compoundInterestRate,
    handleChange,
    handleCollateralChange,
    handleTradingFeeChange,
    handleUseCompoundReserveChange,
    marketCreationStatus,
    resetTradingFee,
    setCompoundInterestRate,
    submit,
    values,
  } = props

  const {
    arbitrator,
    category,
    funding,
    loadedQuestionId,
    outcomes,
    question,
    resolution,
    spread,
    userInputCollateral,
  } = values

  const { markets } = useGraphMarketsFromQuestion(loadedQuestionId || '')

  const [currentToken, setCurrentToken] = useState({ tokenExists: false, symbol: '', marketAddress: '' })
  let showAddCompundService = false
  const currentTokenSymbol = currentToken.symbol.toLowerCase()
  if (currentTokenSymbol in CompoundEnabledTokenType) {
    showAddCompundService = true
  }

  useEffect(() => {
    const selectedToken = markets.find(
      ({ collateralToken }) =>
        collateralToken === DEFAULT_TOKEN_ADDRESS_RINKEBY || collateralToken === DEFAULT_TOKEN_ADDRESS,
    )
    setCurrentToken({
      tokenExists: selectedToken ? true : false,
      symbol: 'DAI',
      marketAddress: selectedToken ? selectedToken.id : '',
    })
    if (isServiceChecked) {
      setCompoundInterestRate(userInputCollateral)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, userInputCollateral.address)

  const [amount, setAmount] = useState<BigNumber>(funding)
  const [amountToDispaly, setAmountToDisplay] = useState<string>('')

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(funding))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  useEffect(() => {
    dispatch(fetchAccountBalance(account, provider, userInputCollateral))
  }, [dispatch, account, provider, userInputCollateral])

  const [collateralBalance, setCollateralBalance] = useState<BigNumber>(Zero)
  const [collateralBalanceFormatted, setCollateralBalanceFormatted] = useState<string>(
    formatBigNumber(collateralBalance, userInputCollateral.decimals, 5),
  )
  const { collateralBalance: maybeCollateralBalance } = useCollateralBalance(userInputCollateral, context)

  const [isNegativeDepositAmount, setIsNegativeDepositAmount] = useState<boolean>(false)

  useEffect(() => {
    setCollateralBalance(maybeCollateralBalance || Zero)
    setCollateralBalanceFormatted(formatBigNumber(maybeCollateralBalance || Zero, userInputCollateral.decimals, 5))
    // eslint-disable-next-line
  }, [maybeCollateralBalance])

  useEffect(() => {
    setIsNegativeDepositAmount(formatBigNumber(funding, userInputCollateral.decimals).includes('-'))
  }, [funding, userInputCollateral.decimals])

  const resolutionDate = resolution && formatDate(resolution, false)

  const [customFee, setCustomFee] = useState(false)
  const [exceedsMaxFee, setExceedsMaxFee] = useState<boolean>(false)

  const toggleServiceCheck = () => {
    setServiceCheck(!isServiceChecked)
    handleUseCompoundReserveChange(!isServiceChecked)
  }
  useEffect(() => {
    setCompoundInterestRate(userInputCollateral)
  }, [isServiceChecked, userInputCollateral]) // eslint-disable-line react-hooks/exhaustive-deps

  const amountError =
    maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero() && funding.gt(maybeCollateralBalance)
      ? `Insufficient balance`
      : funding.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${collateralBalanceFormatted} ${userInputCollateral.symbol}`
      : null

  const isCreateMarketbuttonDisabled =
    MarketCreationStatus.is.creatingAMarket(marketCreationStatus) ||
    MarketCreationStatus.is.done(marketCreationStatus) ||
    currentToken.tokenExists ||
    !balance ||
    funding.isZero() ||
    !account ||
    amountError !== null ||
    exceedsMaxFee ||
    isNegativeDepositAmount

  const showSetAllowance =
    !cpk?.cpk.isSafeApp() &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()
    setAllowanceFinished(true)
  }

  const onCollateralChange = (token: Token | null) => {
    if (!token) return
    const tokenAddressFormatted = token.address.toLowerCase()
    const selectedToken = markets.find(({ collateralToken }) => collateralToken === tokenAddressFormatted)
    setCurrentToken({
      tokenExists: selectedToken ? true : false,
      symbol: token.symbol,
      marketAddress: selectedToken ? selectedToken.id : '',
    })
    handleCollateralChange(token)
    setAllowanceFinished(false)
  }

  const toggleCustomFee = () => {
    if (customFee) {
      resetTradingFee()
      setCustomFee(false)
    } else {
      setCustomFee(true)
    }
  }

  useEffect(() => {
    setExceedsMaxFee(spread > MAX_MARKET_FEE)
  }, [spread])

  const handleAmountChange = (event: BigNumberInputReturn) => {
    setAmount(event.value)
    setAmountToDisplay('')
    handleChange(event)
  }

  const onClickMaxButton = async () => {
    setAmount(collateralBalance)
    handleChange({
      name: 'funding',
      value: collateralBalance,
    })
    setAmountToDisplay(formatBigNumber(collateralBalance, userInputCollateral.decimals, 5))
  }

  return (
    <>
      <CreateCardTop>
        <SubsectionTitleStyled>Your {loadedQuestionId ? 'Imported' : 'Categorical'} Market</SubsectionTitleStyled>
        <SubTitle>Question</SubTitle>
        <QuestionText>{question}</QuestionText>
        <OutcomesTableWrapper borderBottom>
          <OutcomesTable>
            <OutcomesTHead>
              <OutcomesTR>
                <OutcomesTH style={{ width: '60%' }}>Outcome</OutcomesTH>
                <OutcomesTH>Probability</OutcomesTH>
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
                    <OutcomesTD>{outcome.probability.toFixed(2)}%</OutcomesTD>
                  </OutcomesTR>
                )
              })}
            </OutcomesTBody>
          </OutcomesTable>
        </OutcomesTableWrapper>
        <FlexRowWrapper>
          <TitleValueVertical
            date={resolution instanceof Date ? resolution : undefined}
            title={'Closing Date (UTC)'}
            tooltip={true}
            value={resolutionDate}
          />
          <TitleValueVertical title={'Category'} value={category} />
          <TitleValueVertical title={'Arbitrator'} value={<DisplayArbitrator arbitrator={arbitrator} />} />
          {!!loadedQuestionId && (
            <TitleValueVertical title={'Verified by'} value={<VerifiedRow label={values.verifyLabel} />} />
          )}
        </FlexRowWrapper>
      </CreateCardTop>
      <CreateCardBottom>
        <CreateCardBottomRow>
          <SubsectionTitleStyled>Fund Market</SubsectionTitleStyled>
          <CustomFeeToggle onClick={toggleCustomFee}>
            {customFee ? 'use default trading fee' : 'set custom trading fee'}
          </CustomFeeToggle>
        </CreateCardBottomRow>

        <GridTransactionDetailsWrapper noMarginTop={true}>
          <div>
            <CurrenciesWrapper>
              <CurrencySelector
                balance={formatNumber(collateralBalanceFormatted, 5)}
                context={context}
                currency={userInputCollateral.address}
                disabled={false}
                onSelect={onCollateralChange}
              />
            </CurrenciesWrapper>
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  decimals={userInputCollateral.decimals}
                  name="funding"
                  onChange={handleAmountChange}
                  style={{ width: 0 }}
                  value={amount}
                  valueToDisplay={amountToDispaly}
                />
              }
              onClickMaxButton={onClickMaxButton}
              shouldDisplayMaxButton={true}
              symbol={userInputCollateral.symbol}
            />
            {customFee && (
              <CustomFeeWrapper>
                <CustomFeeLabel>Trading Fee</CustomFeeLabel>
                <StyledTradingFeeSelector disabled={false} onSelect={handleTradingFeeChange} />
              </CustomFeeWrapper>
            )}
            {amountError && <GenericError>{amountError}</GenericError>}
          </div>
          <div>
            <TransactionDetailsCard>
              <TransactionDetailsRow
                state={ValueStates.important}
                title={'Earn Trading Fee'}
                value={`${isNaN(spread) ? 0 : spread}%`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                title={'Pool Tokens'}
                value={formatNumber(formatBigNumber(funding, userInputCollateral.decimals))}
              />
            </TransactionDetailsCard>
          </div>
        </GridTransactionDetailsWrapper>

        {exceedsMaxFee && (
          <WarningMessage
            additionalDescription={''}
            danger={true}
            description={`Your custom trading fee exceeds the maximum amount of ${MAX_MARKET_FEE}%`}
            href={''}
            hyperlinkDescription={''}
          />
        )}
        {isNegativeDepositAmount && (
          <WarningMessage
            additionalDescription={''}
            danger={true}
            description={`Your deposit amount should not be negative.`}
            href={''}
            hyperlinkDescription={''}
          />
        )}
        {showAddCompundService && (
          <AddCompoundService
            compoundInterestRate={compoundInterestRate}
            currentToken={userInputCollateral.symbol}
            isServiceChecked={isServiceChecked}
            toggleServiceCheck={toggleServiceCheck}
          />
        )}
        {showSetAllowance && (
          <SetAllowance
            collateral={userInputCollateral}
            finished={allowanceFinished && RemoteData.is.success(allowance)}
            loading={RemoteData.is.asking(allowance)}
            marginBottom
            onUnlock={unlockCollateral}
            style={{ marginBottom: 20 }}
          />
        )}
        <WarningMessage
          additionalDescription={''}
          description={
            currentToken.tokenExists
              ? `An identical market with ${currentToken.symbol} as a currency exists already. Please use a different currency or  provide liquidity for the`
              : 'Providing liquidity is risky and could result in near total loss. It is important to withdraw liquidity before the event occurs and to be aware the market could move abruptly at any time.'
          }
          href={currentToken.tokenExists ? `/#/${currentToken.marketAddress}` : DOCUMENT_FAQ}
          hyperlinkDescription={currentToken.tokenExists ? 'existing market.' : 'More Info'}
        />
        <StyledButtonContainerFullWidth borderTop>
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
          <Button buttonType={ButtonType.secondaryLine} disabled={isCreateMarketbuttonDisabled} onClick={submit}>
            Create Market
          </Button>
        </StyledButtonContainerFullWidth>
      </CreateCardBottom>
      {!MarketCreationStatus.is.ready(marketCreationStatus) && !MarketCreationStatus.is.error(marketCreationStatus) ? (
        <FullLoading message={`${marketCreationStatus._type}...`} />
      ) : null}
    </>
  )
}

export { FundingAndFeeStep }
