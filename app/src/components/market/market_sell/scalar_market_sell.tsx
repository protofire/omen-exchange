import { Zero } from 'ethers/constants'
import { BigNumber, parseUnits } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { SharedPropsInterface } from '../../../pages/market_sections/market_sell_container'
import { calcXValue, formatBigNumber, formatNumber, getUnit } from '../../../util/tools'
import { MarketDetailsTab, MarketMakerData } from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../modal'
import { GridTransactionDetails } from '../common_sections/card_bottom_details/grid_transaction_details'
import { MarketScale } from '../common_sections/card_bottom_details/market_scale'
import { WarningMessage } from '../common_sections/message_text/warning_message'
import { TransactionDetailsCard } from '../common_sections/user_transactions_tokens/transaction_details_card'
import { TransactionDetailsLine } from '../common_sections/user_transactions_tokens/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../common_sections/user_transactions_tokens/transaction_details_row'
import { GenericError } from '../common_styled'

import { PositionSelectionBox } from './position_selection_box'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  margin-right: -24px;
  margin-left: -24px;
  padding-right: 24px;
  padding-left: 24px;
  border-top: 1px solid ${props => props.theme.colors.verticalDivider};
`

interface Props {
  currentTab: MarketDetailsTab
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  sharedProps: SharedPropsInterface
}

export const ScalarMarketSell = (props: Props) => {
  const { currentTab, marketMakerData, switchMarketTab } = props

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
    positionIndex,
    potentialValue,
    probabilitiesOrNewPrediction: newPrediction,
    setAmountShares,
    setAmountSharesFromInput,
    setAmountSharesToDisplay,
    setBalanceItem,
    setIsTransactionModalOpen,
    setPositionIndex,
    tradedCollateral,
    txHash,
    txState,
  } = props.sharedProps

  const { balances, outcomeTokenMarginalPrices, question, scalarHigh, scalarLow } = marketMakerData

  const formattedNewPrediction =
    newPrediction &&
    calcXValue(
      parseUnits(newPrediction.toString(), STANDARD_DECIMALS),
      scalarLow || new BigNumber(0),
      scalarHigh || new BigNumber(0),
    ) / 100

  const isNewPrediction =
    formattedNewPrediction !== 0 && formattedNewPrediction !== Number(outcomeTokenMarginalPrices[1].substring(0, 20))

  return (
    <>
      <MarketScale
        borderTop={true}
        collateral={collateral}
        currentPrediction={isNewPrediction ? String(formattedNewPrediction) : outcomeTokenMarginalPrices[1]}
        currentTab={currentTab}
        long={positionIndex === 1}
        lowerBound={scalarLow || new BigNumber(0)}
        newPrediction={formattedNewPrediction}
        startingPointTitle={isNewPrediction ? 'New prediction' : 'Current prediction'}
        tradeAmount={potentialValue}
        unit={getUnit(question.title)}
        upperBound={scalarHigh || new BigNumber(0)}
      />
      <GridTransactionDetails>
        <div>
          <PositionSelectionBox
            balances={balances}
            decimals={collateral.decimals}
            positionIndex={positionIndex}
            setBalanceItem={setBalanceItem}
            setPositionIndex={setPositionIndex}
          />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmountShares(e.value)
                  setAmountSharesFromInput(e.value.gt(Zero) ? e.value : Zero)
                  setAmountSharesToDisplay('')
                }}
                style={{ width: 0 }}
                value={displaySellShares}
                valueToDisplay={amountSharesToDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmountSharesFromInput(balanceItem.shares)
              setAmountSharesToDisplay(formatBigNumber(balanceItem.shares, collateral.decimals, 5))
            }}
            shouldDisplayMaxButton
            symbol={'Shares'}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow
              title={'Sell Amount'}
              value={`${formatNumber(formatBigNumber(amountShares || Zero, collateral.decimals))} Shares`}
            />
            <TransactionDetailsRow
              emphasizeValue={potentialValue ? potentialValue.gt(0) : false}
              state={ValueStates.success}
              title={'Revenue'}
              value={
                potentialValue
                  ? `${formatNumber(formatBigNumber(potentialValue, collateral.decimals, collateral.decimals))}
                  ${collateral.symbol}`
                  : '0.00'
              }
            />
            <TransactionDetailsRow
              title={'Fee'}
              value={`${
                costFee
                  ? formatNumber(formatBigNumber(costFee.mul(-1), collateral.decimals, collateral.decimals))
                  : '0.00'
              } ${collateral.symbol}`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              emphasizeValue={
                (tradedCollateral && parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0) || false
              }
              state={
                (tradedCollateral &&
                  parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0 &&
                  ValueStates.important) ||
                ValueStates.normal
              }
              title={'Total'}
              value={`${
                tradedCollateral
                  ? formatNumber(formatBigNumber(tradedCollateral, collateral.decimals, collateral.decimals))
                  : '0.00'
              } ${collateral.symbol}`}
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
        />
      )}
      <StyledButtonContainer>
        <Button
          buttonType={ButtonType.secondaryLine}
          onClick={() => {
            switchMarketTab(MarketDetailsTab.swap)
          }}
        >
          Cancel
        </Button>
        <Button buttonType={ButtonType.primaryAlternative} disabled={isSellButtonDisabled} onClick={finish}>
          Sell Position
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
