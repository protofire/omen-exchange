import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { STANDARD_DECIMALS } from '../../../../common/constants'
import {
  useAsyncDerivedValue,
  useCompoundService,
  useConnectedBalanceContext,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useSymbol,
} from '../../../../hooks'
import { MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, getWrapToken } from '../../../../util/networks'
import {
  calcSellAmountInCollateral,
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  getInitialCollateral,
  getSharesInBaseToken,
  mulBN,
} from '../../../../util/tools'
import {
  BalanceItem,
  CompoundTokenType,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Status,
  Token,
  TransactionStep,
} from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../../modal'
import { GenericError } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { OutcomeTable } from '../../common/outcome_table'
import { SwitchTransactionToken } from '../../common/switch_transaction_token'
import { TokenBalance } from '../../common/token_balance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  margin: 0 -24px;
  padding: 20px 24px 0;
  margin-top: ${({ theme }) => theme.borders.borderLineDisabled};
`

const logger = getLogger('Market::Sell')

interface Props extends RouteComponentProps<any> {
  fetchGraphMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

const MarketSellWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId, relay } = context
  const cpk = useConnectedCPKContext()
  const { fetchBalances } = useConnectedBalanceContext()
  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const { address: marketMakerAddress, balances, collateral, fee } = marketMakerData
  let defaultOutcomeIndex = 0
  for (let i = 0; i < balances.length; i++) {
    const shares = parseInt(formatBigNumber(balances[i].shares, collateral.decimals))
    if (shares > 0) {
      defaultOutcomeIndex = i
      break
    }
  }

  const marketMaker = buildMarketMaker(marketMakerAddress)

  const baseCollateral = getInitialCollateral(networkId, collateral, relay)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(defaultOutcomeIndex)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(balances[outcomeIndex])
  const [amountShares, setAmountShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountSharesToDisplay, setAmountSharesToDisplay] = useState<string>('')
  const [displaySellShares, setDisplaySellShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [isNegativeAmountShares, setIsNegativeAmountShares] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [displayCollateral, setDisplayCollateral] = useState<Token>(baseCollateral)
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.idle)
  const [txHash, setTxHash] = useState('')

  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null

  const marketFeeWithTwoDecimals = Number(formatBigNumber(fee, STANDARD_DECIMALS))
  const collateralSymbol = collateral.symbol.toLowerCase()
  const symbol = useSymbol(displayCollateral)
  const wrapToken = getWrapToken(context.networkId)
  let displayTotalSymbol = symbol
  if (collateral.address === displayCollateral.address && collateral.address === wrapToken.address) {
    displayTotalSymbol = displayCollateral.symbol
  }
  useEffect(() => {
    setIsNegativeAmountShares(formatBigNumber(amountShares || Zero, collateral.decimals).includes('-'))
  }, [amountShares, collateral.decimals])
  useEffect(() => {
    setBalanceItem(balances[outcomeIndex])
    // eslint-disable-next-line
  }, [balances[outcomeIndex]])

  useEffect(() => {
    setOutcomeIndex(defaultOutcomeIndex)
    setBalanceItem(balances[defaultOutcomeIndex])
    setAmountShares(null)
    setAmountSharesToDisplay('')
    // eslint-disable-next-line
  }, [collateral.address])

  let displayBalances = balances
  if (
    baseCollateral.address !== collateral.address &&
    collateral.symbol.toLowerCase() in CompoundTokenType &&
    compoundService
  ) {
    displayBalances = getSharesInBaseToken(balances, compoundService, displayCollateral)
  }

  const calcSellAmount = useMemo(
    () => async (
      amountShares: BigNumber,
    ): Promise<[number[], Maybe<BigNumber>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[outcomeIndex]
      const holdingsOfOtherOutcomes = holdings.filter((item, index) => {
        return index !== outcomeIndex
      })
      const amountToSell = calcSellAmountInCollateral(
        // Round down in case of precision error
        amountShares.mul(99999999).div(100000000),
        holdingsOfSoldOutcome,
        holdingsOfOtherOutcomes,
        marketFeeWithTwoDecimals,
      )

      if (!amountToSell) {
        logger.warn(
          `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
        )
        return [[], null, null, null]
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        holdings,
        outcomeIndex,
        amountToSell.mul(-1), // negate amounts because it's a sale
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const potentialValue = mulBN(amountToSell, 1 / (1 - marketFeeWithTwoDecimals))
      const costFee = potentialValue.sub(amountToSell)
      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)
      logger.log(`Amount to sell ${amountToSell}`)
      return [probabilities, costFee, amountToSell, potentialValue]
    },
    [outcomeIndex, balances, marketFeeWithTwoDecimals],
  )

  const [probabilities, costFee, tradedCollateral, potentialValue] = useAsyncDerivedValue(
    amountShares || Zero,
    [balances.map(() => 0), null, null, null],
    calcSellAmount,
  )

  let potentialValueNormalized = potentialValue
  let costFeeNormalized = costFee
  let normalizedTradedCollateral = tradedCollateral
  if (displayCollateral.address !== collateral.address && compoundService) {
    if (potentialValue && potentialValue.gt(0)) {
      potentialValueNormalized = compoundService.calculateCTokenToBaseExchange(displayCollateral, potentialValue)
    } else {
      potentialValueNormalized = new BigNumber('0')
    }
    if (costFee && costFee.gt(0)) {
      costFeeNormalized = compoundService.calculateCTokenToBaseExchange(displayCollateral, costFee)
    } else {
      costFeeNormalized = new BigNumber('0')
    }
    if (tradedCollateral && tradedCollateral.gt(0)) {
      normalizedTradedCollateral = compoundService.calculateCTokenToBaseExchange(displayCollateral, tradedCollateral)
    } else {
      normalizedTradedCollateral = new BigNumber('0')
    }
  }
  const finish = async () => {
    try {
      if (!tradedCollateral) {
        return
      }

      if (!cpk) {
        return
      }
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionProcessing(true)
      setIsTransactionModalOpen(true)
      const sharesAmount = formatBigNumber(amountShares || Zero, collateral.decimals, collateral.decimals)
      let displaySharesAmount = sharesAmount
      if (collateral.symbol.toLowerCase() in CompoundTokenType && amountShares && compoundService) {
        const displaySharesAmountValue = compoundService.calculateCTokenToBaseExchange(baseCollateral, amountShares)
        displaySharesAmount = formatBigNumber(
          displaySharesAmountValue || Zero,
          baseCollateral.decimals,
          baseCollateral.decimals,
        )
      }
      setStatus(Status.Loading)
      setMessage(`Selling ${formatNumber(displaySharesAmount)} shares...`)

      let useBaseToken = false
      if (collateral.address !== displayCollateral.address) {
        useBaseToken = true
      }
      await cpk.sellOutcomes({
        amount: tradedCollateral,
        collateralToken: collateral,
        compoundService,
        outcomeIndex,
        marketMaker,
        conditionalTokens,
        setTxHash,
        setTxState,
        useBaseToken,
      })

      await fetchGraphMarketMakerData()
      await fetchBalances()
      setAmountSharesFromInput(new BigNumber('0'))
      setDisplaySellShares(null)
      setAmountShares(null)
      setStatus(Status.Ready)
      setMessage(`Successfully sold ${formatNumber(displaySharesAmount)} ${balances[outcomeIndex].outcomeName} shares.`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setStatus(Status.Error)
      setTxState(TransactionStep.error)
      setMessage(`Error trying to sell '${balances[outcomeIndex].outcomeName}' shares.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
  }

  const newShares = balances.map((balance, i) =>
    i === outcomeIndex ? balance.shares.sub(amountShares || Zero) : balance.shares,
  )
  let displayNewShares = newShares
  if (collateralSymbol in CompoundTokenType && compoundService) {
    displayNewShares = newShares.map(function(ns) {
      return compoundService.calculateCTokenToBaseExchange(baseCollateral, ns)
    })
  }
  const selectedOutcomeBalance = formatNumber(
    formatBigNumber(balanceItem.shares, baseCollateral.decimals, baseCollateral.decimals),
  )
  let displaySelectedOutcomeBalance = selectedOutcomeBalance
  let displaySelectedOutcomeBalanceValue = balanceItem.shares
  if (collateralSymbol in CompoundTokenType && compoundService) {
    displaySelectedOutcomeBalanceValue = compoundService.calculateCTokenToBaseExchange(
      baseCollateral,
      balanceItem.shares,
    )
    displaySelectedOutcomeBalance = formatNumber(
      formatBigNumber(displaySelectedOutcomeBalanceValue, baseCollateral.decimals),
    )
  }

  const amountError = isTransactionProcessing
    ? null
    : balanceItem.shares === null
    ? null
    : balanceItem.shares.isZero() && amountShares?.gt(balanceItem.shares)
    ? `Insufficient balance`
    : amountShares?.gt(balanceItem.shares)
    ? `Value must be less than or equal to ${displaySelectedOutcomeBalance} shares`
    : null

  const setAmountSharesFromInput = (shares: BigNumber) => {
    if (collateralSymbol in CompoundTokenType && compoundService) {
      const actualAmountOfShares = compoundService.calculateBaseToCTokenExchange(baseCollateral, shares)
      setAmountShares(actualAmountOfShares)
    } else {
      setAmountShares(shares)
    }
    setDisplaySellShares(shares)
  }

  let sellAmountSharesDisplay = formatBigNumber(amountShares || Zero, collateral.decimals)
  if (collateralSymbol in CompoundTokenType && compoundService && amountShares) {
    const sellAmountSharesDisplayValue = compoundService.calculateCTokenToBaseExchange(baseCollateral, amountShares)
    sellAmountSharesDisplay = formatBigNumber(sellAmountSharesDisplayValue || Zero, baseCollateral.decimals)
  }

  const isSellButtonDisabled =
    !amountShares ||
    (status !== Status.Ready && status !== Status.Error) ||
    amountShares?.isZero() ||
    amountError !== null ||
    isNegativeAmountShares
  let toggleCollateral = collateral
  if (collateralSymbol in CompoundTokenType) {
    if (collateral.address === displayCollateral.address) {
      toggleCollateral = baseCollateral
    } else {
      toggleCollateral = collateral
    }
  } else {
    if (collateral.address === wrapToken.address) {
      if (displayCollateral.address === wrapToken.address) {
        toggleCollateral = getNativeAsset(networkId, relay)
      } else {
        toggleCollateral = getWrapToken(networkId)
      }
    }
  }
  const setToggleCollateral = () => {
    if (collateralSymbol in CompoundTokenType) {
      if (displayCollateral.address === baseCollateral.address) {
        setDisplayCollateral(collateral)
      } else {
        setDisplayCollateral(baseCollateral)
      }
    } else {
      if (displayCollateral.address === wrapToken.address) {
        setDisplayCollateral(getNativeAsset(networkId, relay))
      } else {
        setDisplayCollateral(getWrapToken(networkId))
      }
    }
  }
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
        displayBalances={displayBalances}
        displayCollateral={displayCollateral}
        newShares={displayNewShares}
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
          <TokenBalance text="Your Shares" value={displaySelectedOutcomeBalance} />
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={baseCollateral.decimals}
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
              setAmountSharesFromInput(displaySelectedOutcomeBalanceValue)
              setAmountSharesToDisplay(formatBigNumber(displaySelectedOutcomeBalanceValue, baseCollateral.decimals, 5))
            }}
            shouldDisplayMaxButton
            symbol={'Shares'}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Sell Amount'} value={`${formatNumber(sellAmountSharesDisplay)} Shares`} />
            <TransactionDetailsRow
              emphasizeValue={potentialValueNormalized ? potentialValueNormalized.gt(0) : false}
              state={ValueStates.success}
              title={'Profit'}
              value={
                potentialValueNormalized
                  ? `${formatNumber(
                      formatBigNumber(potentialValueNormalized, displayCollateral.decimals, displayCollateral.decimals),
                    )} 
                  ${symbol}`
                  : '0.00'
              }
            />
            <TransactionDetailsRow
              title={'Trading Fee'}
              value={`${
                costFeeNormalized
                  ? formatNumber(
                      formatBigNumber(
                        costFeeNormalized.mul(-1),
                        displayCollateral.decimals,
                        displayCollateral.decimals,
                      ),
                    )
                  : '0.00'
              } ${symbol}`}
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
                normalizedTradedCollateral
                  ? formatNumber(
                      formatBigNumber(
                        normalizedTradedCollateral,
                        displayCollateral.decimals,
                        displayCollateral.decimals,
                      ),
                    )
                  : '0.00'
              } ${displayTotalSymbol}`}
            />
            {(!relay && collateral.address === wrapToken.address) || collateralSymbol in CompoundTokenType ? (
              <SwitchTransactionToken onToggleCollateral={setToggleCollateral} toggleCollatral={toggleCollateral} />
            ) : (
              <span />
            )}
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
