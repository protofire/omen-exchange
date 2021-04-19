import { Zero } from 'ethers/constants'
import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { STANDARD_DECIMALS } from '../../../../common/constants'
import {
  useAsyncDerivedValue,
  useConnectedBalanceContext,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useSymbol,
} from '../../../../hooks'
import { useCpkAllowances } from '../../../../hooks/useCpkAllowances'
import { useERC1155TokenWrappers } from '../../../../hooks/useERC1155TokenWrappers'
import { MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { pseudoNativeAssetAddress } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcPrediction,
  calcSellAmountInCollateral,
  calcXValue,
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  getUnit,
  mulBN,
} from '../../../../util/tools'
import {
  BalanceItem,
  MarketDetailsTab,
  MarketMakerData,
  Status,
  Ternary,
  TransactionStep,
} from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../../modal'
import { GenericError } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'
import { PositionSelectionBox } from '../../common/position_selection_box'
import { SetAllowance } from '../../common/set_allowance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'
import { WrapERC1155 } from '../../common/wrap_erc1155'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  margin-right: -24px;
  margin-left: -24px;
  padding-right: 24px;
  padding-left: 24px;
  border-top: 1px solid ${props => props.theme.colors.verticalDivider};
`

const logger = getLogger('Scalar Market::Sell')

interface Props {
  currentTab: MarketDetailsTab
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

export const ScalarMarketSell = (props: Props) => {
  const { currentTab, fetchGraphMarketMakerData, fetchGraphMarketUserTxData, marketMakerData, switchMarketTab } = props
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()
  const { fetchBalances } = useConnectedBalanceContext()

  const {
    address: marketMakerAddress,
    balances,
    collateral,
    conditionId,
    fee,
    outcomeTokenAmounts,
    outcomeTokenMarginalPrices,
    question,
    scalarHigh,
    scalarLow,
  } = marketMakerData
  const { buildMarketMaker, conditionalTokens, erc20WrapperFactory } = useContracts(context)
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])
  const erc20PositionWrappers = useERC1155TokenWrappers(marketMaker, conditionId, 2, collateral.address)
  const erc20PositionWrapperAddresses = useMemo(
    () => erc20PositionWrappers && erc20PositionWrappers.map(wrapper => wrapper.address),
    [erc20PositionWrappers],
  )
  const cpkAllowances = useCpkAllowances(context.account, erc20PositionWrapperAddresses)

  const [positionIndex, setPositionIndex] = useState(balances[0].totalShares.gte(balances[1].totalShares) ? 0 : 1)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(balances[positionIndex])
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState<string>('')
  const [amountShares, setAmountShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountSharesToDisplay, setAmountSharesToDisplay] = useState<string>('')
  const [isNegativeAmountShares, setIsNegativeAmountShares] = useState<boolean>(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.idle)
  const [txHash, setTxHash] = useState('')
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const [erc20UpgradeLoading, setERC20UpgradeLoading] = useState(false)
  const [erc20UpgradeFinished, setERC20UpgradeFinished] = useState(false)
  const allowance = useMemo(
    () =>
      cpkAllowances[positionIndex] ? cpkAllowances[positionIndex].allowance : RemoteData.success(new BigNumber(0)),
    [cpkAllowances, positionIndex],
  )
  const hasEnoughAllowance = useMemo(() => {
    if (!amountShares || amountShares.isZero()) return Ternary.True
    return RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountShares))
  }, [allowance, amountShares])

  const totalERC1155Shares = balances.reduce((total, balance) => total.add(balance.erc1155Shares), new BigNumber(0))

  // If the market has wrappers set up but the user still has erc1155 tokens, ask to upgrade
  const showWrapERC1155 = !!erc20PositionWrappers && totalERC1155Shares.gt('0')

  const showSetAllowance =
    erc20PositionWrappers &&
    !showWrapERC1155 &&
    collateral.address !== pseudoNativeAssetAddress &&
    !cpk?.isSafeApp &&
    hasEnoughAllowance === Ternary.False

  const symbol = useSymbol(collateral)

  useEffect(() => {
    setIsNegativeAmountShares(formatBigNumber(amountShares || Zero, collateral.decimals).includes('-'))
  }, [amountShares, collateral.decimals])

  useEffect(() => {
    setBalanceItem(balances[positionIndex])
    // eslint-disable-next-line
  }, [balances[positionIndex]])

  useEffect(() => {
    setPositionIndex(balances[0].totalShares.gte(balances[1].totalShares) ? 0 : 1)
    setBalanceItem(balances[positionIndex])
    setAmountShares(null)
    setAmountSharesToDisplay('')
    // eslint-disable-next-line
  }, [collateral.address])

  const unlockWrappedToken = useCallback(async () => {
    if (!cpk) return
    await cpkAllowances[positionIndex].unlock()
    setAllowanceFinished(true)
  }, [cpk, cpkAllowances, positionIndex])

  const wrapERC1155Tokens = useCallback(async () => {
    if (!cpk || !erc20PositionWrappers || !context.account) return
    try {
      setERC20UpgradeLoading(true)
      await cpk.wrapERC1155Tokens({
        conditionalTokens,
        erc20WrapperFactory,
        marketMaker,
        outcomesAmount: outcomeTokenAmounts.length,
        setTxHash,
        setTxState,
      })
    } finally {
      setERC20UpgradeLoading(false)
      setERC20UpgradeFinished(true)
    }
  }, [
    cpk,
    context.account,
    conditionalTokens,
    erc20PositionWrappers,
    erc20WrapperFactory,
    marketMaker,
    outcomeTokenAmounts.length,
  ])

  const calcSellAmount = useMemo(
    () => async (
      amountShares: BigNumber,
    ): Promise<[Maybe<BigNumber>, Maybe<number>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[positionIndex]
      const holdingsOfOtherOutcome = holdings.filter((item, index) => {
        return index !== positionIndex
      })
      const marketFeeWithTwoDecimals = Number(formatBigNumber(fee, STANDARD_DECIMALS))
      const amountToSell = calcSellAmountInCollateral(
        // Round down in case of precision error
        amountShares.mul(99999999).div(100000000),
        holdingsOfSoldOutcome,
        holdingsOfOtherOutcome,
        marketFeeWithTwoDecimals,
      )

      if (!amountToSell) {
        logger.warn(
          `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
        )
        return [null, null, null, null]
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        positionIndex,
        amountToSell.mul(-1),
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const potentialValue = mulBN(amountToSell, 1 / (1 - marketFeeWithTwoDecimals))
      const costFee = potentialValue.sub(amountToSell)

      const newPrediction = calcPrediction(
        pricesAfterTrade[1].toString(),
        scalarLow || new BigNumber(0),
        scalarHigh || new BigNumber(0),
      )

      logger.log(`Amount to sell ${amountToSell}`)
      return [costFee, newPrediction, amountToSell, potentialValue]
    },
    [balances, positionIndex, scalarLow, scalarHigh, fee],
  )

  const [costFee, newPrediction, tradedCollateral, potentialValue] = useAsyncDerivedValue(
    amountShares || Zero,
    [new BigNumber(0), 0, amountShares, new BigNumber(0)],
    calcSellAmount,
  )

  const formattedNewPrediction =
    newPrediction &&
    calcXValue(
      parseUnits(newPrediction.toString(), STANDARD_DECIMALS),
      scalarLow || new BigNumber(0),
      scalarHigh || new BigNumber(0),
    ) / 100

  const finish = async () => {
    const outcomeIndex = positionIndex
    try {
      if (!tradedCollateral) {
        return
      }

      if (!cpk) {
        return
      }

      const sharesAmount = formatBigNumber(amountShares || Zero, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Selling ${sharesAmount} shares...`)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)

      await cpk.sellOutcomes({
        amount: tradedCollateral,
        conditionalTokens,
        erc20WrapperFactory,
        marketMaker,
        outcomeIndex,
        outcomesAmount: outcomeTokenAmounts.length,
        setTxHash,
        setTxState,
      })

      await fetchGraphMarketUserTxData()
      await fetchGraphMarketMakerData()
      await fetchBalances()

      setAmountShares(null)
      setAmountSharesToDisplay('')
      setStatus(Status.Ready)
      setMessage(`Successfully sold ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setTxState(TransactionStep.error)
      setMessage(`Error trying to sell '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
    }
  }

  const selectedOutcomeBalance = formatNumber(formatBigNumber(balanceItem.totalShares, collateral.decimals))

  const amountError =
    balanceItem.totalShares === null
      ? null
      : balanceItem.totalShares.isZero() && amountShares?.gt(balanceItem.totalShares)
      ? `Insufficient balance`
      : amountShares?.gt(balanceItem.totalShares)
      ? `Value must be less than or equal to ${selectedOutcomeBalance} shares`
      : null

  const isSellButtonDisabled =
    !amountShares ||
    (status !== Status.Ready && status !== Status.Error) ||
    amountShares?.isZero() ||
    amountError !== null ||
    isNegativeAmountShares ||
    !!showSetAllowance ||
    !!showWrapERC1155

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
                  setAmountShares(e.value.gt(Zero) ? e.value : Zero)
                  setAmountSharesToDisplay('')
                }}
                style={{ width: 0 }}
                value={amountShares}
                valueToDisplay={amountSharesToDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmountShares(balanceItem.totalShares)
              setAmountSharesToDisplay(formatBigNumber(balanceItem.totalShares, collateral.decimals, 5))
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
                  ? `${formatNumber(formatBigNumber(potentialValue, collateral.decimals, 2))} ${symbol}`
                  : '0.00'
              }
            />
            <TransactionDetailsRow
              title={'Fee'}
              value={`${costFee ? formatNumber(formatBigNumber(costFee.mul(-1), collateral.decimals, 2)) : '0.00'}
                ${symbol}`}
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
                tradedCollateral ? formatNumber(formatBigNumber(tradedCollateral, collateral.decimals, 2)) : '0.00'
              } ${symbol}`}
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
      {showSetAllowance && (
        <SetAllowance
          collateral={collateral}
          description="This permission allows Omen smart contracts to interact with your Outcome Shares. This has to be done for each new Outcome Share"
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockWrappedToken}
          style={{ marginBottom: 20 }}
        />
      )}
      {showWrapERC1155 && (
        <WrapERC1155
          finished={erc20UpgradeFinished && totalERC1155Shares.isZero()}
          loading={erc20UpgradeLoading}
          onWrap={wrapERC1155Tokens}
          style={{ marginBottom: 20 }}
        />
      )}
      <StyledButtonContainer>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.swap)}>
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
