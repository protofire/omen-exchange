import Big from 'big.js'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { DOCUMENT_FAQ } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../contexts'
import { SharedPropsInterface } from '../../../pages/market_sections/market_pool_liquidity_container'
import { RemoteData } from '../../../util/remote_data'
import { bigMax, bigMin, getUnit } from '../../../util/tools'
import { bigNumberToString } from '../../../util/tools/formatting'
import { AdditionalSharesType, MarketDetailsTab, MarketMakerData } from '../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../modal'
import { SetAllowance } from '../common_sections/allowance/set_allowance'
import { GridTransactionDetails } from '../common_sections/card_bottom_details/grid_transaction_details'
import { MarketScale } from '../common_sections/card_bottom_details/market_scale'
import { WarningMessage } from '../common_sections/message_text/warning_message'
import { CurrencySelector } from '../common_sections/user_transactions_tokens/currency_selector'
import { TokenBalance } from '../common_sections/user_transactions_tokens/token_balance'
import { TransactionDetailsCard } from '../common_sections/user_transactions_tokens/transaction_details_card'
import { TransactionDetailsLine } from '../common_sections/user_transactions_tokens/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../common_sections/user_transactions_tokens/transaction_details_row'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../common_styled'

import { UserPoolData } from './user_pool_data'

const BottomButtonWrapper = styled(ButtonContainer)`
  justify-content: space-between;
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
  margin: 0 -24px;
  padding: 20px 24px 0;
`

const ButtonBottomRight = styled.div`
  display: flex;
  align-items: center;
`

const WarningMessageStyled = styled(WarningMessage)`
  margin-bottom: 0;
  margin-bottom: 24px;
`

const SetAllowanceStyled = styled(SetAllowance)`
  margin-bottom: 20px;
`

enum Tabs {
  deposit,
  withdraw,
}

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
  sharedProps: SharedPropsInterface
}

export const ScalarMarketPoolLiquidity = (props: Props) => {
  const { marketMakerData, sharedProps } = props
  const {
    activeTab,
    allowance,
    allowanceFinished,
    amountToFund,
    amountToFundDisplay,
    amountToRemove,
    amountToRemoveDisplay,
    claim,
    collateral,
    collateralAmountError,
    collateralBalance,
    deposit,
    depositedTokens,
    depositedTokensTotal,
    disableDepositButton,
    disableDepositTab,
    disableWithdrawButton,
    disableWithdrawTab,
    earnedRewards,
    feeFormatted,
    fundingBalance,
    isNegativeAmountToFund,
    isNegativeAmountToRemove,
    isTransactionModalOpen,
    liquidityMiningCampaign,
    message,
    poolTokens,
    proxyIsUpToDate,
    remainingRewards,
    rewardApr,
    setActiveTab,
    setAmountToFund,
    setAmountToFundDisplay,
    setAmountToRemove,
    setAmountToRemoveDisplay,
    setIsTransactionModalOpen,
    sharesAmountError,
    sharesBalance,
    shouldDisplayMaxButton,
    showSetAllowance,
    showUpgrade,
    stake,
    totalRewards,
    totalUserLiquidity,
    txHash,
    txState,
    unlockCollateral,
    upgradeFinished,
    upgradeProxy,
    userStakedTokens,
    walletBalance,
    withdraw,
  } = sharedProps

  const {
    fee,
    outcomeTokenAmounts,
    outcomeTokenMarginalPrices,
    question,
    scalarHigh,
    scalarLow,
    totalEarnings,
    totalPoolShares,
    userEarnings,
  } = marketMakerData
  const context = useConnectedWeb3Context()
  const history = useHistory()

  const [additionalShares, setAdditionalShares] = useState<number>(0)
  const [additionalSharesType, setAdditionalSharesType] = useState<Maybe<AdditionalSharesType>>()

  useEffect(() => {
    // Use floor as rounding method
    Big.RM = 0

    const poolWeight =
      Number(outcomeTokenAmounts[0]) > Number(outcomeTokenAmounts[1])
        ? new Big(outcomeTokenAmounts[0])
        : new Big(outcomeTokenAmounts[1])

    const liquidityAmount = amountToFund?.gt(0)
      ? new Big(amountToFund.toString())
      : amountToRemove?.gt(0)
      ? new Big(amountToRemove?.toString())
      : new Big(0)

    const sendBackAmounts = outcomeTokenAmounts.map(amount => {
      const outcomeTokenAmount = new Big(amount)
      try {
        const remaining = liquidityAmount.mul(outcomeTokenAmount).div(poolWeight)
        return liquidityAmount.sub(remaining)
      } catch {
        return new Big(0)
      }
    })
    const extraShares = bigMax(sendBackAmounts).sub(bigMin(sendBackAmounts) || new Big(0))
    setAdditionalShares(Number(extraShares.toFixed(0)) / 10 ** collateral.decimals)

    if (activeTab === Tabs.deposit) {
      Number(outcomeTokenAmounts[0]) > Number(outcomeTokenAmounts[1])
        ? setAdditionalSharesType(AdditionalSharesType.long)
        : setAdditionalSharesType(AdditionalSharesType.short)
    } else {
      Number(outcomeTokenAmounts[0]) > Number(outcomeTokenAmounts[1])
        ? setAdditionalSharesType(AdditionalSharesType.short)
        : setAdditionalSharesType(AdditionalSharesType.long)
    }
  }, [collateral.decimals, outcomeTokenAmounts, amountToFund, amountToRemove, activeTab])

  return (
    <>
      <UserPoolData
        collateral={collateral}
        currentApr={rewardApr}
        earnedRewards={earnedRewards}
        remainingRewards={remainingRewards}
        symbol={collateral.symbol}
        totalEarnings={totalEarnings}
        totalPoolShares={totalPoolShares}
        totalRewards={totalRewards}
        totalUserLiquidity={totalUserLiquidity}
        userEarnings={userEarnings}
      />
      <MarketScale
        additionalShares={additionalShares}
        additionalSharesType={additionalSharesType}
        borderTop={true}
        collateral={collateral}
        currentPrediction={outcomeTokenMarginalPrices ? outcomeTokenMarginalPrices[1] : null}
        liquidityAmount={amountToFund}
        lowerBound={scalarLow || new BigNumber(0)}
        startingPointTitle={'Current prediction'}
        unit={getUnit(question.title)}
        upperBound={scalarHigh || new BigNumber(0)}
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
              active={activeTab === Tabs.withdraw}
              disabled={disableWithdrawTab}
              onClick={() => setActiveTab(Tabs.withdraw)}
            >
              Withdraw
            </ButtonTab>
          </TabsGrid>
          {activeTab === Tabs.deposit && (
            <>
              <CurrenciesWrapper>
                <CurrencySelector
                  addBalances
                  addNativeAsset
                  balance={walletBalance}
                  context={context}
                  currency={collateral.address}
                  disabled
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
                  setAmountToFundDisplay(bigNumberToString(collateralBalance, collateral.decimals, 5, true))
                }}
                shouldDisplayMaxButton={shouldDisplayMaxButton}
                symbol={collateral.symbol}
              />

              {collateralAmountError && <GenericError>{collateralAmountError}</GenericError>}
            </>
          )}
          {activeTab === Tabs.withdraw && (
            <>
              <TokenBalance text="Pool Tokens" value={sharesBalance} />

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
                  setAmountToRemoveDisplay(bigNumberToString(fundingBalance, collateral.decimals, 5, true))
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
                value={`${bigNumberToString(poolTokens, collateral.decimals)}`}
              />
            </TransactionDetailsCard>
          )}
          {activeTab === Tabs.withdraw && (
            <TransactionDetailsCard>
              <TransactionDetailsRow
                emphasizeValue={userEarnings.gt(0)}
                state={ValueStates.success}
                title="Earned"
                value={`${bigNumberToString(userEarnings, collateral.decimals)} ${collateral.symbol}`}
              />
              <TransactionDetailsRow
                state={ValueStates.normal}
                title="Deposited"
                value={`${bigNumberToString(depositedTokens, collateral.decimals)} ${collateral.symbol}`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={depositedTokensTotal.gt(0)}
                state={(depositedTokensTotal.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Total"
                value={`${bigNumberToString(depositedTokensTotal, collateral.decimals)} ${collateral.symbol}`}
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
      {activeTab === Tabs.deposit && showUpgrade && (
        <SetAllowanceStyled
          finished={upgradeFinished && RemoteData.is.success(proxyIsUpToDate)}
          loading={RemoteData.is.asking(proxyIsUpToDate)}
          onUnlock={upgradeProxy}
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
      <BottomButtonWrapper>
        <Button
          buttonType={ButtonType.secondaryLine}
          onClick={() => (history.length > 2 ? history.goBack() : history.replace('/liquidity'))}
        >
          Back
        </Button>
        <ButtonBottomRight>
          {liquidityMiningCampaign && (
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={!(userStakedTokens && userStakedTokens.gt(0) && earnedRewards > 0)}
              onClick={() => claim()}
              style={{ marginRight: 12 }}
            >
              Claim Rewards
            </Button>
          )}
          {liquidityMiningCampaign && fundingBalance.gt(0) && rewardApr > 0 && (
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={fundingBalance.eq(0)}
              onClick={() => stake()}
              style={{ marginRight: 12 }}
            >
              Stake
            </Button>
          )}
          {activeTab === Tabs.deposit && (
            <Button buttonType={ButtonType.primary} disabled={disableDepositButton} onClick={deposit}>
              Deposit
            </Button>
          )}
          {activeTab === Tabs.withdraw && (
            <Button buttonType={ButtonType.primary} disabled={disableWithdrawButton} onClick={withdraw}>
              Withdraw
            </Button>
          )}
        </ButtonBottomRight>
      </BottomButtonWrapper>
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        isOpen={isTransactionModalOpen}
        message={message}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}
