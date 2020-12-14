import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { DOCUMENT_FAQ } from '../../../../common/constants'
import {
  useCollateralBalance,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useFundingBalance,
} from '../../../../hooks'
import { ERC20Service } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcAddFundingSendAmounts,
  calcPoolTokens,
  calcRemoveFundingSendAmounts,
  formatBigNumber,
  formatNumber,
} from '../../../../util/tools'
import { MarketDetailsTab, MarketMakerData, OutcomeTableValue, Status, Ternary, Token } from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder, TitleValue } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { CurrenciesWrapper, GenericError } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { OutcomeTable } from '../../common/outcome_table'
import { SetAllowance } from '../../common/set_allowance'
import { TokenBalance } from '../../common/token_balance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  theme?: any
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

enum Tabs {
  deposit,
  withdraw,
}

const BottomButtonWrapper = styled(ButtonContainer)`
  justify-content: space-between;
  margin: 0 -24px;
  padding: 20px 24px 0;
`

const TabsGrid = styled.div`
  display: grid;
  grid-column-gap: 13px;
  grid-template-columns: 1fr 1fr;
  margin: 0 0 20px;
`
const WarningMessageStyled = styled(WarningMessage)`
  margin-bottom: 0;
  margin-bottom: 24px;
`
const SetAllowanceStyled = styled(SetAllowance)`
  margin-bottom: 20px;
`

const UserDataTitleValue = styled(TitleValue)`
  flex: 0 calc(50% - 16px);

  &:nth-child(odd) {
    margin-right: 32px;
  }
  &:nth-child(-n + 2) {
    margin-bottom: 12px;
  }

  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex: 0 50%;

    margin-right: 0 !important;
    margin-bottom: 0 !important;

    &:not(:first-child) {
      margin-top: 12px;
    }
    &:nth-child(2) {
      order: 2;
    }
    &:nth-child(3) {
      order: 1;
    }
    &:nth-child(4) {
      order: 3;
    }
  }
`

const UserData = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -25px;
  padding: 20px 24px;
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-wrap: nowrap;
    flex-direction: column;
  }
`

const logger = getLogger('Market::Fund')

const MarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData } = props
  const { address: marketMakerAddress, balances, fee, totalEarnings, totalPoolShares, userEarnings } = marketMakerData
  const history = useHistory()
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const cpk = useConnectedCPKContext()

  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const signer = useMemo(() => provider.getSigner(), [provider])
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const [collateral, setCollateral] = useState<Token>(marketMakerData.collateral)
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const [amountToFund, setAmountToFund] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToFundDisplay, setAmountToFundDisplay] = useState<string>('')
  const [isNegativeAmountToFund, setIsNegativeAmountToFund] = useState<boolean>(false)
  const [amountToRemove, setAmountToRemove] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveDisplay, setAmountToRemoveDisplay] = useState<string>('')
  const [isNegativeAmountToRemove, setIsNegativeAmountToRemove] = useState<boolean>(false)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)

  useEffect(() => {
    setIsNegativeAmountToFund(formatBigNumber(amountToFund || Zero, collateral.decimals).includes('-'))
  }, [amountToFund, collateral.decimals])

  useEffect(() => {
    setIsNegativeAmountToRemove(formatBigNumber(amountToRemove || Zero, collateral.decimals).includes('-'))
  }, [amountToRemove, collateral.decimals])

  useEffect(() => {
    setCollateral(marketMakerData.collateral)
    setAmountToFund(null)
    setAmountToFundDisplay('')
    setAmountToRemove(null)
    setAmountToRemoveDisplay('')
    // eslint-disable-next-line
  }, [marketMakerData.collateral.address])

  const resolutionDate = marketMakerData.question.resolution.getTime()
  const currentDate = new Date().getTime()
  const disableDepositTab = currentDate > resolutionDate
  const [activeTab, setActiveTab] = useState(disableDepositTab ? Tabs.withdraw : Tabs.deposit)

  const feeFormatted = useMemo(() => `${formatBigNumber(fee.mul(Math.pow(10, 2)), 18)}%`, [fee])

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountToFund || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  const poolTokens = calcPoolTokens(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const sendAmountsAfterAddingFunding = calcAddFundingSendAmounts(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const sharesAfterAddingFunding = sendAmountsAfterAddingFunding
    ? balances.map((balance, i) => balance.shares.add(sendAmountsAfterAddingFunding[i]))
    : balances.map(balance => balance.shares)

  const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(
    amountToRemove || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const depositedTokens = sendAmountsAfterRemovingFunding.reduce((min: BigNumber, amount: BigNumber) =>
    amount.lt(min) ? amount : min,
  )

  const sharesAfterRemovingFunding = balances.map((balance, i) => {
    return balance.shares.add(sendAmountsAfterRemovingFunding[i]).sub(depositedTokens)
  })

  const showSharesChange = activeTab === Tabs.deposit ? amountToFund?.gt(0) : amountToRemove?.gt(0)

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const probabilities = balances.map(balance => balance.probability)
  const showSetAllowance =
    !cpk?.cpk.isSafeApp() &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)
  const depositedTokensTotal = depositedTokens.add(userEarnings)
  const { fetchFundingBalance, fundingBalance: maybeFundingBalance } = useFundingBalance(marketMakerAddress, context)
  const fundingBalance = maybeFundingBalance || Zero

  const walletBalance = formatNumber(formatBigNumber(collateralBalance, collateral.decimals, 5), 5)
  const sharesBalance = formatBigNumber(fundingBalance, collateral.decimals)

  const totalUserShareAmounts = calcRemoveFundingSendAmounts(
    fundingBalance,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const totalDepositedTokens = totalUserShareAmounts.reduce((min: BigNumber, amount: BigNumber) =>
    amount.lt(min) ? amount : min,
  )

  const totalUserLiquidity = totalDepositedTokens.add(userEarnings)

  const addFunding = async () => {
    setModalTitle('Funds Deposit')

    try {
      if (!cpk) {
        return
      }
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }
      if (hasEnoughAllowance === Ternary.Unknown) {
        throw new Error("This method shouldn't be called if 'hasEnoughAllowance' is unknown")
      }

      const fundsAmount = formatBigNumber(amountToFund || Zero, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Depositing funds: ${fundsAmount} ${collateral.symbol}...`)

      if (!cpk.cpk.isSafeApp()) {
        const collateralAddress = await marketMaker.getCollateralToken()
        const collateralService = new ERC20Service(provider, account, collateralAddress)

        if (hasEnoughAllowance === Ternary.False) {
          await collateralService.approveUnlimited(cpk.address)
        }
      }

      await cpk.addFunding({
        amount: amountToFund || Zero,
        collateral,
        marketMaker,
      })

      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()

      setStatus(Status.Ready)
      setAmountToFund(null)
      setAmountToFundDisplay('')
      setMessage(`Successfully deposited ${fundsAmount} ${collateral.symbol}`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to deposit funds.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const removeFunding = async () => {
    setModalTitle('Funds Withdrawal')
    try {
      if (!cpk) {
        return
      }
      setStatus(Status.Loading)

      const fundsAmount = formatBigNumber(depositedTokensTotal, collateral.decimals)

      setMessage(`Withdrawing funds: ${fundsAmount} ${collateral.symbol}...`)

      const collateralAddress = await marketMaker.getCollateralToken()
      const conditionId = await marketMaker.getConditionId()

      await cpk.removeFunding({
        amountToMerge: depositedTokens,
        collateralAddress,
        conditionId,
        conditionalTokens,
        earnings: userEarnings,
        marketMaker,
        outcomesCount: balances.length,
        sharesToBurn: amountToRemove || Zero,
      })
      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()

      setStatus(Status.Ready)
      setAmountToRemove(null)
      setAmountToRemoveDisplay('')
      setMessage(`Successfully withdrew ${fundsAmount} ${collateral.symbol}`)
      setIsModalTransactionResultOpen(true)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to withdraw funds.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()

    setAllowanceFinished(true)
  }

  const collateralAmountError =
    maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero() && amountToFund?.gt(maybeCollateralBalance)
      ? `Insufficient balance`
      : amountToFund?.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${walletBalance} ${collateral.symbol}`
      : null

  const sharesAmountError =
    maybeFundingBalance === null
      ? null
      : maybeFundingBalance.isZero() && amountToRemove?.gt(maybeFundingBalance)
      ? `Insufficient balance`
      : amountToRemove?.gt(maybeFundingBalance)
      ? `Value must be less than or equal to ${sharesBalance} pool shares`
      : null

  const disableDepositButton =
    !amountToFund ||
    amountToFund?.isZero() ||
    (!cpk?.cpk.isSafeApp() && hasEnoughAllowance !== Ternary.True) ||
    collateralAmountError !== null ||
    currentDate > resolutionDate ||
    isNegativeAmountToFund

  const disableWithdrawButton =
    !amountToRemove ||
    amountToRemove?.isZero() ||
    amountToRemove?.gt(fundingBalance) ||
    sharesAmountError !== null ||
    isNegativeAmountToRemove

  return (
    <>
      <UserData>
        <UserDataTitleValue
          title="Your Liquidity"
          value={`${formatNumber(formatBigNumber(totalUserLiquidity, collateral.decimals))} ${collateral.symbol}`}
        />
        <UserDataTitleValue
          title="Total Pool Tokens"
          value={`${formatNumber(formatBigNumber(totalPoolShares, collateral.decimals))}`}
        />
        <UserDataTitleValue
          state={userEarnings.gt(0) ? ValueStates.success : undefined}
          title="Your Earnings"
          value={`${userEarnings.gt(0) ? '+' : ''}${formatNumber(formatBigNumber(userEarnings, collateral.decimals))} ${
            collateral.symbol
          }`}
        />
        <UserDataTitleValue
          state={totalEarnings.gt(0) ? ValueStates.success : undefined}
          title="Total Earnings"
          value={`${totalEarnings.gt(0) ? '+' : ''}${formatNumber(
            formatBigNumber(totalEarnings, collateral.decimals),
          )} ${collateral.symbol}`}
        />
      </UserData>
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={[OutcomeTableValue.OutcomeProbability, OutcomeTableValue.Payout, OutcomeTableValue.Bonded]}
        displayRadioSelection={false}
        newShares={activeTab === Tabs.deposit ? sharesAfterAddingFunding : sharesAfterRemovingFunding}
        probabilities={probabilities}
        showSharesChange={showSharesChange}
      />
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab
              active={disableDepositTab ? false : activeTab === Tabs.deposit}
              disabled={disableDepositTab}
              onClick={() => setActiveTab(Tabs.deposit)}
            >
              Deposit
            </ButtonTab>
            <ButtonTab
              active={disableDepositTab ? true : activeTab === Tabs.withdraw}
              onClick={() => setActiveTab(Tabs.withdraw)}
            >
              Withdraw
            </ButtonTab>
          </TabsGrid>
          {activeTab === Tabs.deposit && (
            <>
              <CurrenciesWrapper>
                <CurrencySelector
                  balance={walletBalance}
                  context={context}
                  currency={collateral.address}
                  disabled
                  onSelect={(token: Token | null) => {
                    if (token) {
                      setCollateral(token)
                      setAmountToFund(new BigNumber(0))
                    }
                  }}
                />
              </CurrenciesWrapper>

              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={collateral.decimals}
                    name="amountToFund"
                    onChange={(e: BigNumberInputReturn) => {
                      setAmountToFund(e.value)
                      setAmountToFundDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToFund}
                    valueToDisplay={amountToFundDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToFund(collateralBalance)
                  setAmountToFundDisplay(formatBigNumber(collateralBalance, collateral.decimals, 5))
                }}
                shouldDisplayMaxButton
                symbol={collateral.symbol}
              />

              {collateralAmountError && <GenericError>{collateralAmountError}</GenericError>}
            </>
          )}
          {activeTab === Tabs.withdraw && (
            <>
              <TokenBalance text="Pool Tokens" value={formatNumber(sharesBalance)} />

              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={collateral.decimals}
                    name="amountToRemove"
                    onChange={(e: BigNumberInputReturn) => {
                      setAmountToRemove(e.value)
                      setAmountToRemoveDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToRemove}
                    valueToDisplay={amountToRemoveDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToRemove(fundingBalance)
                  setAmountToRemoveDisplay(formatBigNumber(fundingBalance, collateral.decimals, 5))
                }}
                shouldDisplayMaxButton
                symbol="Shares"
              />

              {sharesAmountError && <GenericError>{sharesAmountError}</GenericError>}
            </>
          )}
        </div>
        <div>
          {activeTab === Tabs.deposit && (
            <TransactionDetailsCard>
              <TransactionDetailsRow
                emphasizeValue={fee.gt(0)}
                state={ValueStates.success}
                title="Earn Trading Fee"
                value={feeFormatted}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={poolTokens.gt(0)}
                state={(poolTokens.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Pool Tokens"
                value={`${formatNumber(formatBigNumber(poolTokens, collateral.decimals))}`}
              />
            </TransactionDetailsCard>
          )}
          {activeTab === Tabs.withdraw && (
            <TransactionDetailsCard>
              <TransactionDetailsRow
                emphasizeValue={userEarnings.gt(0)}
                state={ValueStates.success}
                title="Earned"
                value={`${formatNumber(formatBigNumber(userEarnings, collateral.decimals))} ${collateral.symbol}`}
              />
              <TransactionDetailsRow
                state={ValueStates.normal}
                title="Deposited"
                value={`${formatNumber(formatBigNumber(depositedTokens, collateral.decimals))} ${collateral.symbol}`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={depositedTokensTotal.gt(0)}
                state={(depositedTokensTotal.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Total"
                value={`${formatNumber(formatBigNumber(depositedTokensTotal, collateral.decimals))} ${
                  collateral.symbol
                }`}
              />
            </TransactionDetailsCard>
          )}
        </div>
      </GridTransactionDetails>
      {activeTab === Tabs.deposit && showSetAllowance && (
        <SetAllowanceStyled
          collateral={collateral}
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockCollateral}
        />
      )}
      <WarningMessageStyled
        additionalDescription=""
        description="Providing liquidity is risky and could result in near total loss. It is important to withdraw liquidity before the event occurs and to be aware the market could move abruptly at any time."
        href={DOCUMENT_FAQ}
        hyperlinkDescription="More Info"
      />
      {isNegativeAmountToFund && (
        <WarningMessage
          additionalDescription=""
          danger={true}
          description="Your deposit amount should not be negative."
          href=""
          hyperlinkDescription=""
        />
      )}
      {isNegativeAmountToRemove && (
        <WarningMessage
          additionalDescription=""
          danger
          description="Your withdraw amount should not be negative."
          href=""
          hyperlinkDescription=""
        />
      )}
      <BottomButtonWrapper borderTop>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => history.goBack()}>
          Cancel
        </Button>
        {activeTab === Tabs.deposit && (
          <Button buttonType={ButtonType.secondaryLine} disabled={disableDepositButton} onClick={() => addFunding()}>
            Deposit
          </Button>
        )}
        {activeTab === Tabs.withdraw && (
          <Button
            buttonType={ButtonType.secondaryLine}
            disabled={disableWithdrawButton}
            onClick={() => removeFunding()}
          >
            Withdraw
          </Button>
        )}
      </BottomButtonWrapper>
      <ModalTransactionResult
        isOpen={isModalTransactionResultOpen}
        onClose={() => setIsModalTransactionResultOpen(false)}
        status={status}
        text={message}
        title={modalTitle}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const MarketPoolLiquidity = withRouter(MarketPoolLiquidityWrapper)
