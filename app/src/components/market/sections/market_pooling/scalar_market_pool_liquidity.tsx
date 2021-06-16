import Big from 'big.js'
import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { DOCUMENT_FAQ, STANDARD_DECIMALS } from '../../../../common/constants'
import {
  useCollateralBalance,
  useCompoundService,
  useConnectedBalanceContext,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
  useFundingBalance,
  useSymbol,
} from '../../../../hooks'
import { getLogger } from '../../../../util/logger'
import {
  getNativeAsset,
  getNativeCompoundAsset,
  getToken,
  getWrapToken,
  pseudoNativeAssetAddress,
} from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  bigMax,
  bigMin,
  calcPoolTokens,
  calcRemoveFundingSendAmounts,
  formatBigNumber,
  formatNumber,
  getBaseTokenForCToken,
  getInitialCollateral,
  getUnit,
  isDust,
} from '../../../../util/tools'
import {
  AdditionalSharesType,
  CompoundTokenType,
  MarketDetailsTab,
  MarketMakerData,
  Ternary,
  Token,
  TransactionStep,
} from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../../modal'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'
import { SetAllowance } from '../../common/set_allowance'
import { SwitchTransactionToken } from '../../common/switch_transaction_token'
import { TokenBalance } from '../../common/token_balance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

import { UserPoolData } from './user_pool_data'

const BottomButtonWrapper = styled(ButtonContainer)`
  justify-content: space-between;
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
  margin: 0 -24px;
  padding: 20px 24px 0;
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
}

const logger = getLogger('Scalar Market::Fund')

export const ScalarMarketPoolLiquidity = (props: Props) => {
  const { fetchGraphMarketMakerData, fetchGraphMarketUserTxData, marketMakerData } = props
  const {
    address: marketMakerAddress,
    balances,
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
  const { account, library: provider, networkId, relay } = context
  const cpk = useConnectedCPKContext()
  const { fetchBalances } = useConnectedBalanceContext()
  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true
  const [upgradeFinished, setUpgradeFinished] = useState(false)

  const resolutionDate = question.resolution.getTime()
  const currentDate = new Date().getTime()
  const disableDepositTab = currentDate > resolutionDate

  const [activeTab, setActiveTab] = useState(disableDepositTab ? Tabs.withdraw : Tabs.deposit)

  const wrapToken = getWrapToken(networkId)
  const nativeAsset = getNativeAsset(networkId, relay)
  const initialCollateral =
    marketMakerData.collateral.address.toLowerCase() === wrapToken.address.toLowerCase()
      ? nativeAsset
      : marketMakerData.collateral
  const [collateral, setCollateral] = useState<Token>(initialCollateral)
  let symbol = useSymbol(collateral)

  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null

  const [amountToFund, setAmountToFund] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToFundDisplay, setAmountToFundDisplay] = useState<string>('')
  const [amountToRemove, setAmountToRemove] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveDisplay, setAmountToRemoveDisplay] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [displayCollateral, setDisplayCollateral] = useState<Token>(getInitialCollateral(context.networkId, collateral))
  const [isNegativeAmountToFund, setIsNegativeAmountToFund] = useState<boolean>(false)
  const [isNegativeAmountToRemove, setIsNegativeAmountToRemove] = useState<boolean>(false)
  const [additionalShares, setAdditionalShares] = useState<number>(0)
  const [additionalSharesType, setAdditionalSharesType] = useState<Maybe<AdditionalSharesType>>()
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.idle)
  const [txHash, setTxHash] = useState('')
  const [amountToFundNormalized, setAmountToFundNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveNormalized, setAmountToRemoveNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const collateralSymbol = collateral.symbol.toLowerCase()

  let baseCollateral = collateral
  if (collateralSymbol in CompoundTokenType) {
    const nativeCompoundAsset = getNativeCompoundAsset(networkId)
    if (collateralSymbol === nativeCompoundAsset.symbol.toLowerCase()) {
      baseCollateral = getNativeAsset(networkId)
    } else {
      const baseCollateralSymbol = getBaseTokenForCToken(collateral.symbol.toLowerCase()) as KnownToken
      baseCollateral = getToken(networkId, baseCollateralSymbol)
    }
    symbol = baseCollateral.symbol
  }

  useEffect(() => {
    setIsNegativeAmountToFund(formatBigNumber(amountToFund || Zero, collateral.decimals).includes('-'))
  }, [amountToFund, collateral.decimals])

  useEffect(() => {
    setIsNegativeAmountToRemove(formatBigNumber(amountToRemove || Zero, collateral.decimals).includes('-'))
  }, [amountToRemove, collateral.decimals])

  const signer = useMemo(() => provider.getSigner(), [provider])
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, displayCollateral.address)

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    displayCollateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const { fetchFundingBalance, fundingBalance: maybeFundingBalance } = useFundingBalance(marketMakerAddress, context)
  const fundingBalance = maybeFundingBalance || Zero

  const walletBalance = formatNumber(formatBigNumber(collateralBalance, displayCollateral.decimals, 5), 5)
  const sharesBalance = formatBigNumber(fundingBalance, collateral.decimals)

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountToFund || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())
  const showSetAllowance =
    displayCollateral.address !== pseudoNativeAssetAddress &&
    !cpk?.isSafeApp &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  const poolTokens = calcPoolTokens(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const disableWithdrawTab = isDust(fundingBalance, collateral.decimals)

  const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(
    amountToRemove || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const depositedTokens = sendAmountsAfterRemovingFunding.length
    ? sendAmountsAfterRemovingFunding.reduce((min: BigNumber, amount: BigNumber) => (amount.lt(min) ? amount : min))
    : new BigNumber(0)
  const depositedTokensTotal = depositedTokens.add(userEarnings)

  const feeFormatted = useMemo(() => `${formatBigNumber(fee.mul(Math.pow(10, 2)), STANDARD_DECIMALS)}%`, [fee])

  const totalUserShareAmounts = calcRemoveFundingSendAmounts(
    fundingBalance,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const totalDepositedTokens = totalUserShareAmounts.length
    ? totalUserShareAmounts.reduce((min: BigNumber, amount: BigNumber) => (amount.lt(min) ? amount : min))
    : new BigNumber(0)

  const totalUserLiquidity = totalDepositedTokens.add(userEarnings)

  const showUpgrade =
    (!isUpdated && collateral.address === pseudoNativeAssetAddress) ||
    (upgradeFinished && collateral.address === pseudoNativeAssetAddress)

  const upgradeProxy = async () => {
    if (!cpk) {
      return
    }

    await updateProxy()
    setUpgradeFinished(true)
  }

  const addFunding = async () => {
    try {
      if (!cpk) {
        return
      }

      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }

      if (!cpk?.isSafeApp && collateral.address !== pseudoNativeAssetAddress && hasEnoughAllowance !== Ternary.True) {
        throw new Error("This method shouldn't be called if 'hasEnoughAllowance' is unknown or false")
      }

      let useBaseToken = false
      if (displayCollateral.address !== collateral.address && collateral.symbol.toLowerCase() in CompoundTokenType) {
        useBaseToken = true
      }
      let fundsAmount = formatBigNumber(amountToFund || Zero, collateral.decimals)
      if (collateralSymbol in CompoundTokenType && displayCollateral.symbol === baseCollateral.symbol) {
        fundsAmount = formatBigNumber(amountToFundNormalized || Zero, displayCollateral.decimals)
      }

      setMessage(`Depositing funds: ${fundsAmount} ${displayCollateral.symbol}...`)

      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)

      const inputCollateral =
        collateral.symbol !== displayCollateral.symbol && collateral.symbol === nativeAsset.symbol
          ? displayCollateral
          : collateral

      await cpk.addFunding({
        amount: amountToFundNormalized || Zero,
        compoundService,
        collateral: inputCollateral,
        marketMaker,
        setTxHash,
        setTxState,
        useBaseToken,
      })

      await fetchGraphMarketUserTxData()
      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await fetchBalances()

      setAmountToFund(null)
      setAmountToFundDisplay('')
      setAmountToFundNormalized(null)
      setMessage(`Successfully deposited ${formatNumber(fundsAmount)}  ${displayCollateral.symbol}`)
    } catch (err) {
      setTxState(TransactionStep.error)
      setMessage(`Error trying to deposit funds.`)
      logger.error(`${message} - ${err.message}`)
    }
  }

  const removeFunding = async () => {
    try {
      if (!cpk) {
        return
      }

      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)
      let fundsAmount = formatBigNumber(depositedTokensTotal, collateral.decimals)
      if (
        compoundService &&
        collateralSymbol in CompoundTokenType &&
        displayCollateral.symbol === baseCollateral.symbol
      ) {
        const displayDepositedTokensTotal = compoundService.calculateCTokenToBaseExchange(
          baseCollateral,
          depositedTokensTotal,
        )
        fundsAmount = formatBigNumber(displayDepositedTokensTotal || Zero, displayCollateral.decimals)
      }

      setMessage(`Withdrawing funds: ${formatNumber(fundsAmount)} ${displayCollateral.symbol}...`)

      const conditionId = await marketMaker.getConditionId()
      let useBaseToken = false
      if (displayCollateral.address === pseudoNativeAssetAddress) {
        useBaseToken = true
      } else if (collateral.symbol.toLowerCase() in CompoundTokenType) {
        if (displayCollateral.address !== collateral.address) {
          useBaseToken = true
        }
      }

      await cpk.removeFunding({
        amountToMerge: depositedTokens,
        collateral: marketMakerData.collateral,
        conditionId,
        conditionalTokens,
        compoundService,
        earnings: userEarnings,
        marketMaker,
        outcomesCount: balances.length,
        setTxHash,
        setTxState,
        sharesToBurn: amountToRemove || Zero,
        useBaseToken,
      })

      await fetchGraphMarketUserTxData()
      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await fetchBalances()

      setAmountToRemove(null)
      setAmountToRemoveDisplay('')
      setAmountToRemoveNormalized(null)
      setMessage(`Successfully withdrew ${formatNumber(fundsAmount)} ${displayCollateral.symbol}`)
    } catch (err) {
      setTxState(TransactionStep.error)
      setMessage(`Error trying to withdraw funds.`)
      logger.error(`${message} - ${err.message}`)
    }
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
      ? `Value must be less than or equal to ${walletBalance} ${displayCollateral.symbol}`
      : null

  const disableDepositButton =
    !amountToFund ||
    amountToFund?.isZero() ||
    (!cpk?.isSafeApp &&
      displayCollateral.address !== pseudoNativeAssetAddress &&
      hasEnoughAllowance !== Ternary.True) ||
    collateralAmountError !== null ||
    currentDate > resolutionDate ||
    isNegativeAmountToFund

  let currencyFilters =
    collateral.address === wrapToken.address || collateral.address === pseudoNativeAssetAddress
      ? [wrapToken.address.toLowerCase(), pseudoNativeAssetAddress.toLowerCase()]
      : []

  if (collateralSymbol in CompoundTokenType) {
    if (baseCollateral.symbol.toLowerCase() === 'eth') {
      currencyFilters = [collateral.address, pseudoNativeAssetAddress.toLowerCase()]
    } else {
      currencyFilters = [collateral.address, baseCollateral.address]
    }
  }
  let toggleCollateral = collateral

  if (collateralSymbol in CompoundTokenType) {
    if (collateral.address === displayCollateral.address) {
      toggleCollateral = baseCollateral
    } else {
      toggleCollateral = collateral
    }
  } else {
    if (collateral.address === nativeAsset.address || collateral.address === wrapToken.address) {
      if (displayCollateral.address === wrapToken.address) {
        toggleCollateral = getNativeAsset(context.networkId)
      } else {
        toggleCollateral = getWrapToken(context.networkId)
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
        setDisplayCollateral(getNativeAsset(context.networkId))
      } else {
        setDisplayCollateral(getWrapToken(context.networkId))
      }
    }
  }

  const setBuyCollateral = (token: Token) => {
    const userInputCollateralSymbol = token.symbol.toLowerCase()
    if (userInputCollateralSymbol in CompoundTokenType) {
      setDisplayCollateral(token)
    } else if (token.address === pseudoNativeAssetAddress && !(collateral.symbol.toLowerCase() in CompoundTokenType)) {
      setCollateral(token)
      setDisplayCollateral(token)
    } else {
      setDisplayCollateral(token)
    }
  }

  const setDisplayCollateralAmountToFund = (value: BigNumber) => {
    if (compoundService) {
      const baseAmount = compoundService.calculateBaseToCTokenExchange(displayCollateral, value)
      setAmountToFund(baseAmount)
    } else {
      setAmountToFund(value)
    }
    setAmountToFundNormalized(value)
  }

  const setWithdrawAmountToRemove = (val: BigNumber) => {
    let normalizedWithdrawAmount = val
    if (compoundService && collateral.symbol.toLowerCase() in CompoundTokenType) {
      normalizedWithdrawAmount = compoundService.calculateBaseToCTokenExchange(baseCollateral, normalizedWithdrawAmount)
    }
    setAmountToRemove(normalizedWithdrawAmount)
    setAmountToRemoveNormalized(val)
  }

  const shouldDisplayMaxButton = collateral.address !== pseudoNativeAssetAddress

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

  const currencySelectorIsDisabled = relay ? true : currencyFilters.length ? false : true
  let sellNoteUserEarnings = userEarnings
  let sellNoteDepositedTokens = depositedTokens
  let sellNoteDepositedTokensTotal = depositedTokensTotal
  let displayUserEarnings = userEarnings
  let displayPoolTokens = poolTokens
  let displayFundingBalance = fundingBalance
  let displaySharesBalance = sharesBalance
  // Set display values if the collateral is cToken type
  if (compoundService && collateralSymbol in CompoundTokenType) {
    displayPoolTokens = compoundService.calculateCTokenToBaseExchange(baseCollateral, poolTokens)
    displayUserEarnings = compoundService.calculateCTokenToBaseExchange(baseCollateral, userEarnings)
    const sharesBalanceBN = compoundService.calculateCTokenToBaseExchange(baseCollateral, fundingBalance)
    displaySharesBalance = formatBigNumber(sharesBalanceBN, baseCollateral.decimals)
    displayFundingBalance = compoundService.calculateCTokenToBaseExchange(baseCollateral, fundingBalance)
    if (displayCollateral.address === baseCollateral.address) {
      sellNoteUserEarnings = displayUserEarnings
      sellNoteDepositedTokens = compoundService.calculateCTokenToBaseExchange(baseCollateral, depositedTokens)
      sellNoteDepositedTokensTotal = compoundService.calculateCTokenToBaseExchange(baseCollateral, depositedTokensTotal)
    }
  }
  let displayTotalSymbol = symbol
  if (activeTab === Tabs.withdraw) {
    if (collateral.address === pseudoNativeAssetAddress || collateralSymbol in CompoundTokenType) {
      displayTotalSymbol = displayCollateral.symbol
    }
  }

  const sharesAmountError =
    maybeFundingBalance === null
      ? null
      : maybeFundingBalance.isZero() && amountToRemove?.gt(maybeFundingBalance)
      ? `Insufficient balance`
      : amountToRemove?.gt(maybeFundingBalance)
      ? `Value must be less than or equal to ${displaySharesBalance} pool shares`
      : null

  const disableWithdrawButton =
    !amountToRemove ||
    amountToRemove?.isZero() ||
    amountToRemoveNormalized?.gt(displayFundingBalance) ||
    sharesAmountError !== null ||
    isNegativeAmountToRemove

  return (
    <>
      <UserPoolData
        collateral={collateral}
        symbol={symbol}
        totalEarnings={totalEarnings}
        totalPoolShares={totalPoolShares}
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
              active={!disableWithdrawTab && activeTab === Tabs.withdraw}
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
                  currency={displayCollateral.address}
                  disabled={currencySelectorIsDisabled}
                  filters={currencyFilters}
                  onSelect={(token: Token | null) => {
                    if (token) {
                      setBuyCollateral(token)
                      setDisplayCollateralAmountToFund(new BigNumber(0))
                    }
                  }}
                />
              </CurrenciesWrapper>

              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={displayCollateral.decimals}
                    name="amountToFund"
                    onChange={(e: BigNumberInputReturn) => {
                      setDisplayCollateralAmountToFund(e.value)
                      setAmountToFundDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToFundNormalized}
                    valueToDisplay={amountToFundDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToFund(collateralBalance)
                  setAmountToFundDisplay(formatBigNumber(collateralBalance, displayCollateral.decimals, 5))
                }}
                shouldDisplayMaxButton={shouldDisplayMaxButton}
                symbol={displayCollateral.symbol}
              />

              {collateralAmountError && <GenericError>{collateralAmountError}</GenericError>}
            </>
          )}
          {activeTab === Tabs.withdraw && (
            <>
              <TokenBalance text="Pool Tokens" value={formatNumber(displaySharesBalance)} />

              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={baseCollateral.decimals}
                    name="amountToRemove"
                    onChange={(e: BigNumberInputReturn) => {
                      setWithdrawAmountToRemove(e.value)
                      setAmountToRemoveDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToRemoveNormalized}
                    valueToDisplay={amountToRemoveDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToRemove(fundingBalance)
                  setAmountToRemoveDisplay(formatBigNumber(displayFundingBalance, baseCollateral.decimals, 5))
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
                emphasizeValue={displayPoolTokens.gt(0)}
                state={(displayPoolTokens.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Pool Tokens"
                value={`${formatNumber(
                  formatBigNumber(displayPoolTokens, baseCollateral.decimals, baseCollateral.decimals),
                )}`}
              />
            </TransactionDetailsCard>
          )}
          {activeTab === Tabs.withdraw && (
            <TransactionDetailsCard>
              <TransactionDetailsRow
                emphasizeValue={userEarnings.gt(0)}
                state={ValueStates.success}
                title="Earned"
                value={`${formatNumber(
                  formatBigNumber(sellNoteUserEarnings, displayCollateral.decimals, displayCollateral.decimals),
                )} ${displayTotalSymbol}`}
              />
              <TransactionDetailsRow
                state={ValueStates.normal}
                title="Deposited"
                value={`${formatNumber(
                  formatBigNumber(sellNoteDepositedTokens, displayCollateral.decimals, displayCollateral.decimals),
                )} ${displayTotalSymbol}`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={depositedTokensTotal.gt(0)}
                state={(depositedTokensTotal.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Total"
                value={`${formatNumber(
                  formatBigNumber(sellNoteDepositedTokensTotal, displayCollateral.decimals, displayCollateral.decimals),
                )} ${displayTotalSymbol}`}
              />
              {collateral.address === pseudoNativeAssetAddress ? (
                <SwitchTransactionToken onToggleCollateral={setToggleCollateral} toggleCollatral={toggleCollateral} />
              ) : collateralSymbol in CompoundTokenType ? (
                <SwitchTransactionToken onToggleCollateral={setToggleCollateral} toggleCollatral={toggleCollateral} />
              ) : (
                <span />
              )}
            </TransactionDetailsCard>
          )}
        </div>
      </GridTransactionDetails>
      {activeTab === Tabs.deposit && showSetAllowance && (
        <SetAllowanceStyled
          collateral={displayCollateral}
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockCollateral}
        />
      )}
      {activeTab === Tabs.deposit && showUpgrade && (
        <SetAllowanceStyled
          collateral={getNativeAsset(networkId, relay)}
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
        {activeTab === Tabs.deposit && (
          <Button buttonType={ButtonType.primaryAlternative} disabled={disableDepositButton} onClick={addFunding}>
            Deposit
          </Button>
        )}
        {activeTab === Tabs.withdraw && (
          <Button buttonType={ButtonType.primaryAlternative} disabled={disableWithdrawButton} onClick={removeFunding}>
            Withdraw
          </Button>
        )}
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
