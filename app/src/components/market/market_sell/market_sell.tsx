import { Zero } from 'ethers/constants'
import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { SharedPropsInterface } from '../../../pages/market_sections/market_sell_container'
import { bigNumberToString } from '../../../util/tools/formatting'
import { MarketDetailsTab, MarketMakerData, OutcomeTableValue } from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../modal'
import { GridTransactionDetails } from '../common_sections/card_bottom_details/grid_transaction_details'
import { WarningMessage } from '../common_sections/message_text/warning_message'
import { OutcomeTable } from '../common_sections/tables/outcome_table'
import { TokenBalance } from '../common_sections/user_transactions_tokens/token_balance'
import { TransactionDetailsCard } from '../common_sections/user_transactions_tokens/transaction_details_card'
import { TransactionDetailsLine } from '../common_sections/user_transactions_tokens/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../common_sections/user_transactions_tokens/transaction_details_row'
import { GenericError } from '../common_styled'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  margin: 0 -24px;
  padding: 20px 24px 0;
  margin-top: ${({ theme }) => theme.borders.borderLineDisabled};
`

interface Props extends RouteComponentProps<any> {
  fetchGraphMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  sharedProps: SharedPropsInterface
}

const MarketSellWrapper: React.FC<Props> = (props: Props) => {
  const {
    amountError,
    amountShares,
    amountSharesToDisplay,
    balanceItem,
    collateral,
    costFee,
    displaySellShares,
    finish,
    isNegativeAmountShares,
    isSellButtonDisabled,
    isTransactionModalOpen,
    message,
    outcomeIndex,
    potentialValue,
    probabilitiesOrNewPrediction: probabilities,
    selectedOutcomeBalance,
    setAmountSharesFromInput,
    setAmountSharesToDisplay,
    setBalanceItem,
    setIsTransactionModalOpen,
    setOutcomeIndex,
    tradedCollateral,
    txHash,
    txState,
  } = props.sharedProps

  const { marketMakerData, switchMarketTab } = props
  const { balances } = marketMakerData

  const newShares = balances.map((balance, i) =>
    i === outcomeIndex ? balance.shares.sub(amountShares || Zero) : balance.shares,
  )

  const sellAmountSharesDisplay = bigNumberToString(amountShares || Zero, collateral.decimals)

  return (
    <>
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={[
          OutcomeTableValue.Payout,
          OutcomeTableValue.Outcome,
          OutcomeTableValue.Probability,
          OutcomeTableValue.Bonded,
        ]}
        newShares={newShares}
        outcomeHandleChange={(value: number) => {
          setOutcomeIndex(value)
          setBalanceItem(balances[value])
        }}
        outcomeSelected={outcomeIndex}
        probabilities={probabilities}
        showPriceChange={amountShares?.gt(0)}
        showSharesChange={amountShares?.gt(0)}
      />
      <GridTransactionDetails>
        <div>
          <TokenBalance text="Your Shares" value={selectedOutcomeBalance} />
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmountSharesFromInput(e.value)
                  setAmountSharesToDisplay('')
                }}
                style={{ width: 0 }}
                value={displaySellShares}
                valueToDisplay={amountSharesToDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmountSharesFromInput(balanceItem.shares)
              setAmountSharesToDisplay(bigNumberToString(balanceItem.shares, collateral.decimals, 5, true))
            }}
            shouldDisplayMaxButton
            symbol={'Shares'}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Sell Amount'} value={`${sellAmountSharesDisplay} Shares`} />
            <TransactionDetailsRow
              emphasizeValue={potentialValue ? potentialValue.gt(0) : false}
              state={ValueStates.success}
              title={'Profit'}
              value={
                potentialValue
                  ? `${bigNumberToString(potentialValue, collateral.decimals)} 
                  ${collateral.symbol}`
                  : '0.00'
              }
            />
            <TransactionDetailsRow
              title={'Trading Fee'}
              value={`${costFee ? bigNumberToString(costFee.mul(-1), collateral.decimals) : '0.00'} ${
                collateral.symbol
              }`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              emphasizeValue={(tradedCollateral && tradedCollateral.gt(Zero)) || false}
              state={(tradedCollateral && tradedCollateral.gt(Zero) && ValueStates.important) || ValueStates.normal}
              title={'Total'}
              value={`${tradedCollateral ? bigNumberToString(tradedCollateral, collateral.decimals) : '0.00'} ${
                collateral.symbol
              }`}
            />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>
      {isNegativeAmountShares && (
        <WarningMessage
          additionalDescription={''}
          danger={true}
          description={`Your sell amount should not be negative.`}
          href={''}
          hyperlinkDescription={''}
          marginBottom={true}
        />
      )}
      <StyledButtonContainer borderTop={true} marginTop={isNegativeAmountShares}>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.swap)}>
          Cancel
        </Button>
        <Button buttonType={ButtonType.secondaryLine} disabled={isSellButtonDisabled} onClick={() => finish()}>
          Sell
        </Button>
      </StyledButtonContainer>
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

export const MarketSell = withRouter(MarketSellWrapper)
