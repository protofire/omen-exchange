import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { DOCUMENT_FAQ, MARKET_FEE } from '../../../../common/constants'
import {
  useCollateralBalance,
  useConnectedWeb3Context,
  useContracts,
  useCpk,
  useCpkAllowance,
  useFundingBalance,
} from '../../../../hooks'
import { ERC20Service } from '../../../../services'
import { CPKService } from '../../../../services/cpk'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcAddFundingSendAmounts,
  calcPoolTokens,
  calcRemoveFundingSendAmounts,
  formatBigNumber,
} from '../../../../util/tools'
import { MarketMakerData, OutcomeTableValue, Status, Ternary } from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { SectionTitle, TextAlign } from '../../../common/text/section_title'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { GenericError } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketTopDetailsOpen } from '../../common/market_top_details_open'
import { OutcomeTable } from '../../common/outcome_table'
import { SetAllowance } from '../../common/set_allowance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { ViewCard } from '../../common/view_card'
import { WalletBalance } from '../../common/wallet_balance'
import { WarningMessage } from '../../common/warning_message'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  theme?: any
}

enum Tabs {
  deposit,
  withdraw,
}

const LeftButton = styled(Button)`
  margin-right: auto;
`

const TabsGrid = styled.div`
  display: grid;
  grid-column-gap: 13px;
  grid-template-columns: 1fr 1fr;
  margin: 0 0 25px;
`
const WarningMessageStyled = styled(WarningMessage)`
  margin-top: 20px;
  margin-bottom: 0;
`

const logger = getLogger('Market::Fund')

const MarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props
  const { address: marketMakerAddress, balances, collateral, question, totalPoolShares, userEarnings } = marketMakerData

  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const cpk = useCpk()

  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const signer = useMemo(() => provider.getSigner(), [provider])
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const [amountToFund, setAmountToFund] = useState<BigNumber>(new BigNumber(0))
  const [amountToRemove, setAmountToRemove] = useState<BigNumber>(new BigNumber(0))
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)

  const [activeTab, setActiveTab] = useState(Tabs.deposit)

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountToFund))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  const poolTokens = calcPoolTokens(
    amountToFund,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const sendAmountsAfterAddingFunding = calcAddFundingSendAmounts(
    amountToFund,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const sharesAfterAddingFunding = sendAmountsAfterAddingFunding
    ? balances.map((balance, i) => balance.shares.add(sendAmountsAfterAddingFunding[i]))
    : balances.map(balance => balance.shares)

  const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(
    amountToRemove,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const depositedTokens = sendAmountsAfterRemovingFunding.reduce((min: BigNumber, amount: BigNumber) =>
    amount.lt(min) ? amount : min,
  )

  const sharesAfterRemovingFunding = balances.map((balance, i) => {
    return balance.shares.add(sendAmountsAfterRemovingFunding[i]).sub(depositedTokens)
  })

  const showSharesChange = activeTab === Tabs.deposit ? amountToFund.gt(0) : amountToRemove.gt(0)

  const addFunding = async () => {
    setModalTitle('Funds Deposit')

    try {
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }
      if (hasEnoughAllowance === Ternary.Unknown) {
        throw new Error("This method shouldn't be called if 'hasEnoughAllowance' is unknown")
      }

      const fundsAmount = formatBigNumber(amountToFund, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Depositing funds: ${fundsAmount} ${collateral.symbol}...`)

      const cpk = await CPKService.create(provider)

      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, account, collateralAddress)

      if (hasEnoughAllowance === Ternary.False) {
        await collateralService.approveUnlimited(cpk.address)
      }

      await cpk.addFunding({
        amount: amountToFund,
        collateral,
        marketMaker,
      })

      setStatus(Status.Ready)
      setAmountToFund(new BigNumber(0))
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
      setStatus(Status.Loading)

      const fundsAmount = formatBigNumber(amountToRemove, collateral.decimals)

      setMessage(`Withdrawing funds: ${fundsAmount} ${collateral.symbol}...`)

      const collateralAddress = await marketMaker.getCollateralToken()
      const conditionId = await marketMaker.getConditionId()
      const cpk = await CPKService.create(provider)

      await cpk.removeFunding({
        amountToMerge: depositedTokens,
        collateralAddress,
        conditionId,
        conditionalTokens,
        earnings: userEarnings,
        marketMaker,
        outcomesCount: balances.length,
        sharesToBurn: amountToRemove,
      })

      setStatus(Status.Ready)
      setAmountToRemove(new BigNumber(0))
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

  const maybeCollateralBalance = useCollateralBalance(collateral, context)
  const collateralBalance = maybeCollateralBalance || Zero
  const probabilities = balances.map(balance => balance.probability)
  const showSetAllowance =
    allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False
  const depositedTokensTotal = depositedTokens.add(userEarnings)
  const goBackToAddress = `/${marketMakerAddress}`
  const maybeFundingBalance = useFundingBalance(marketMakerAddress, context)
  const fundingBalance = maybeFundingBalance || Zero

  const walletBalance = formatBigNumber(collateralBalance, collateral.decimals)
  const sharesBalance = formatBigNumber(fundingBalance, collateral.decimals)

  const collateralAmountError =
    maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero()
      ? `Insufficient balance`
      : amountToFund.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${walletBalance} ${collateral.symbol}`
      : null

  const sharesAmountError =
    maybeFundingBalance === null
      ? null
      : maybeFundingBalance.isZero()
      ? `Insufficient balance`
      : amountToRemove.gt(maybeFundingBalance)
      ? `Value must be less than or equal to ${sharesBalance} pool shares`
      : null

  const disableDepositButton =
    amountToFund.isZero() || hasEnoughAllowance !== Ternary.True || collateralAmountError !== null
  const disableWithdrawButton =
    amountToRemove.isZero() || amountToRemove.gt(fundingBalance) || sharesAmountError !== null

  return (
    <>
      <SectionTitle backTo={goBackToAddress} textAlign={TextAlign.left} title={question.title} />
      <ViewCard>
        <MarketTopDetailsOpen
          isLiquidityProvision={true}
          marketMakerData={marketMakerData}
          title="Pool Liquidity"
          toggleTitle="Market Information"
        />
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.OutcomeProbability, OutcomeTableValue.Payout]}
          displayRadioSelection={false}
          newShares={activeTab === Tabs.deposit ? sharesAfterAddingFunding : sharesAfterRemovingFunding}
          probabilities={probabilities}
          showSharesChange={showSharesChange}
        />
        <WarningMessageStyled
          description={
            'Providing liquidity is risky and could result in near total loss. It is important to withdraw liquidity before the event occurs and to be aware the market could move abruptly at any time.'
          }
          href={DOCUMENT_FAQ}
          hyperlinkDescription={'More Info'}
        />
        <GridTransactionDetails>
          <div>
            <TabsGrid>
              <ButtonTab active={activeTab === Tabs.deposit} onClick={() => setActiveTab(Tabs.deposit)}>
                Deposit
              </ButtonTab>
              <ButtonTab active={activeTab === Tabs.withdraw} onClick={() => setActiveTab(Tabs.withdraw)}>
                Withdraw
              </ButtonTab>
            </TabsGrid>
            {activeTab === Tabs.deposit && (
              <>
                <WalletBalance
                  onClick={() => setAmountToFund(collateralBalance)}
                  symbol={collateral.symbol}
                  value={walletBalance}
                />
                <TextfieldCustomPlaceholder
                  formField={
                    <BigNumberInput
                      decimals={collateral.decimals}
                      name="amountToFund"
                      onChange={(e: BigNumberInputReturn) => setAmountToFund(e.value)}
                      value={amountToFund}
                    />
                  }
                  symbol={collateral.symbol}
                />
                {collateralAmountError && <GenericError>{collateralAmountError}</GenericError>}
              </>
            )}
            {activeTab === Tabs.withdraw && (
              <>
                <WalletBalance
                  onClick={() => setAmountToRemove(fundingBalance)}
                  symbol="Shares"
                  text="My Pool Tokens"
                  value={sharesBalance}
                />
                <TextfieldCustomPlaceholder
                  formField={
                    <BigNumberInput
                      decimals={collateral.decimals}
                      name="amountToRemove"
                      onChange={(e: BigNumberInputReturn) => setAmountToRemove(e.value)}
                      value={amountToRemove}
                    />
                  }
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
                  emphasizeValue={MARKET_FEE > 0}
                  state={ValueStates.success}
                  title={'Earn Trading Fee'}
                  value={`${MARKET_FEE}%`}
                />
                <TransactionDetailsLine />
                <TransactionDetailsRow
                  emphasizeValue={poolTokens.gt(0)}
                  state={(poolTokens.gt(0) && ValueStates.important) || ValueStates.normal}
                  title={'Pool Tokens'}
                  value={`${formatBigNumber(poolTokens, collateral.decimals)}`}
                />
              </TransactionDetailsCard>
            )}
            {activeTab === Tabs.withdraw && (
              <TransactionDetailsCard>
                <TransactionDetailsRow
                  emphasizeValue={userEarnings.gt(0)}
                  state={ValueStates.success}
                  title={'Earned'}
                  value={`${formatBigNumber(userEarnings, collateral.decimals)} ${collateral.symbol}`}
                />
                <TransactionDetailsRow
                  state={ValueStates.normal}
                  title={'Deposited'}
                  value={`${formatBigNumber(depositedTokens, collateral.decimals)} ${collateral.symbol}`}
                />
                <TransactionDetailsLine />
                <TransactionDetailsRow
                  emphasizeValue={depositedTokensTotal.gt(0)}
                  state={(depositedTokensTotal.gt(0) && ValueStates.important) || ValueStates.normal}
                  title={'Total'}
                  value={`${formatBigNumber(depositedTokensTotal, collateral.decimals)} ${collateral.symbol}`}
                />
              </TransactionDetailsCard>
            )}
          </div>
        </GridTransactionDetails>
        {activeTab === Tabs.deposit && showSetAllowance && (
          <SetAllowance
            collateral={collateral}
            finished={allowanceFinished && RemoteData.is.success(allowance)}
            loading={RemoteData.is.asking(allowance)}
            onUnlock={unlockCollateral}
          />
        )}
        <ButtonContainer>
          <LeftButton buttonType={ButtonType.secondaryLine} onClick={() => props.history.push(goBackToAddress)}>
            Cancel
          </LeftButton>
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
        </ButtonContainer>
      </ViewCard>
      <ModalTransactionResult
        goBackToAddress={goBackToAddress}
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
