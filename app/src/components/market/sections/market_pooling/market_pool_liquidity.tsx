import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { DOCUMENT_FAQ } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../contexts'
import { SharedPropsInterface } from '../../../../pages/market_sections/market_pool_liquidity_container'
import { getNativeAsset } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
<<<<<<< HEAD
import { bigNumberToString, calcAddFundingSendAmounts, calcRemoveFundingSendAmounts } from '../../../../util/tools'
import { MarketDetailsTab, MarketMakerData, OutcomeTableValue } from '../../../../util/types'
=======
import {
  calcAddFundingSendAmounts,
  calcPoolTokens,
  calcRemoveFundingSendAmounts,
  formatBigNumber,
  formatNumber,
  getBaseTokenForCToken,
  getInitialCollateral,
  getSharesInBaseToken,
  isDust,
} from '../../../../util/tools'
import {
  CompoundTokenType,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Ternary,
  Token,
  TransactionStep,
} from '../../../../util/types'
>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../../modal'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { OutcomeTable } from '../../common/outcome_table'
import { SetAllowance } from '../../common/set_allowance'
import { TokenBalance } from '../../common/token_balance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

import { UserPoolData } from './user_pool_data'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  theme?: any
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  sharedProps: SharedPropsInterface
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

const WarningMessageStyled = styled(WarningMessage)`
  margin-bottom: 0;
  margin-bottom: 24px;
`
const SetAllowanceStyled = styled(SetAllowance)`
  margin-bottom: 20px;
`

const MarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  const { marketMakerData, sharedProps } = props
  const {
    activeTab,
    addFunding,
    allowance,
    allowanceFinished,
    amountToFund,
    amountToFundDisplay,
    amountToRemove,
    amountToRemoveDisplay,
    collateral,
    collateralAmountError,
    collateralBalance,
    depositedTokens,
    depositedTokensTotal,
    disableDepositButton,
    disableDepositTab,
    disableWithdrawButton,
    feeFormatted,
    fundingBalance,
    isNegativeAmountToFund,
    isNegativeAmountToRemove,
    isTransactionModalOpen,
    message,
    poolTokens,
    proxyIsUpToDate,
    removeFunding,
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
    totalUserLiquidity,
    txHash,
    txState,
    unlockCollateral,
    upgradeFinished,
    upgradeProxy,
    walletBalance,
  } = sharedProps
  const { balances, fee, totalEarnings, totalPoolShares, userEarnings } = marketMakerData
  const history = useHistory()
  const context = useConnectedWeb3Context()
<<<<<<< HEAD
  const { networkId, relay } = context
=======
  const { account, cpk, library: provider, networkId, relay } = context
  const { fetchBalances } = context.balances

  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const signer = useMemo(() => provider.getSigner(), [provider])
  const [allowanceFinished, setAllowanceFinished] = useState(false)

  const wrapToken = getWrapToken(networkId)
  const nativeAsset = getNativeAsset(networkId, relay)
  const initialCollateral =
    marketMakerData.collateral.address.toLowerCase() === wrapToken.address.toLowerCase()
      ? nativeAsset
      : marketMakerData.collateral
  const [collateral, setCollateral] = useState<Token>(initialCollateral)

  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null

  const [amountToFund, setAmountToFund] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToFundDisplay, setAmountToFundDisplay] = useState<string>('')
  const [isNegativeAmountToFund, setIsNegativeAmountToFund] = useState<boolean>(false)
  const [amountToRemove, setAmountToRemove] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveDisplay, setAmountToRemoveDisplay] = useState<string>('')
  const [isNegativeAmountToRemove, setIsNegativeAmountToRemove] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [displayCollateral, setDisplayCollateral] = useState<Token>(
    getInitialCollateral(context.networkId, collateral, relay),
  )
  const { allowance, unlock } = useCpkAllowance(signer, displayCollateral.address)
  let symbol = useSymbol(collateral)
  const collateralSymbol = collateral.symbol.toLowerCase()
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)
  const [amountToFundNormalized, setAmountToFundNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveNormalized, setAmountToRemoveNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.idle)
  const [txHash, setTxHash] = useState('')

  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy(displayCollateral.address === pseudoNativeAssetAddress)
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true

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

  useEffect(() => {
    setCollateral(initialCollateral)
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

  let displayTotalSymbol = symbol
  if (activeTab === Tabs.withdraw) {
    if (collateral.address === pseudoNativeAssetAddress || collateralSymbol in CompoundTokenType) {
      displayTotalSymbol = displayCollateral.symbol
    }
  }

  const feeFormatted = useMemo(() => `${formatBigNumber(fee.mul(Math.pow(10, 2)), STANDARD_DECIMALS)}%`, [fee])

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountToFund || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  const poolTokens = calcPoolTokens(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f

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
<<<<<<< HEAD
=======

  const depositedTokens = sendAmountsAfterRemovingFunding
    .map((amount, i) => {
      return amount.add(balances[i].shares)
    })
    .reduce((min: BigNumber, amount: BigNumber) => (amount.lt(min) ? amount : min))
>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f

  const sharesAfterRemovingFunding = balances.map((balance, i) => {
    return balance.shares.add(sendAmountsAfterRemovingFunding[i]).sub(depositedTokens)
  })

  const showSharesChange = activeTab === Tabs.deposit ? amountToFund?.gt(0) : amountToRemove?.gt(0)

  const probabilities = balances.map(balance => balance.probability)
<<<<<<< HEAD

=======
  const showSetAllowance =
    displayCollateral.address !== pseudoNativeAssetAddress &&
    !cpk?.isSafeApp &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  const showUpgrade = !isUpdated || upgradeFinished

  const depositedTokensTotal = depositedTokens.add(userEarnings)
  const { fetchFundingBalance, fundingBalance: maybeFundingBalance } = useFundingBalance(marketMakerAddress, context)
  const fundingBalance = maybeFundingBalance || Zero

  const walletBalance = formatNumber(formatBigNumber(collateralBalance, displayCollateral.decimals, 5), 5)
  const sharesBalance = formatBigNumber(fundingBalance, collateral.decimals)

  const totalUserShareAmounts = calcRemoveFundingSendAmounts(
    fundingBalance,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const totalDepositedTokens = fundingBalance.gt(0)
    ? totalUserShareAmounts
        .map((amount, i) => {
          return amount.add(balances[i].shares)
        })
        .reduce((min: BigNumber, amount: BigNumber) => (amount.lt(min) ? amount : min))
    : new BigNumber(0)

  const totalUserLiquidity = totalDepositedTokens.add(userEarnings)

  const addFunding = async () => {
    try {
      if (!cpk) {
        return
      }
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }
      if (
        !cpk?.isSafeApp &&
        collateral.address !== pseudoNativeAssetAddress &&
        displayCollateral.address !== pseudoNativeAssetAddress &&
        hasEnoughAllowance !== Ternary.True
      ) {
        throw new Error("This method shouldn't be called if 'hasEnoughAllowance' is unknown or false")
      }
      let useBaseToken = false
      if (displayCollateral.address !== collateral.address && collateral.symbol.toLowerCase() in CompoundTokenType) {
        useBaseToken = true
      }
      let fundsAmount = formatBigNumber(amountToFund || Zero, collateral.decimals, collateral.decimals)
      if (collateralSymbol in CompoundTokenType && displayCollateral.symbol === baseCollateral.symbol) {
        fundsAmount = formatBigNumber(
          amountToFundNormalized || Zero,
          displayCollateral.decimals,
          displayCollateral.decimals,
        )
      }
      setMessage(`Depositing funds: ${formatNumber(fundsAmount)} ${displayCollateral.symbol}...`)

      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionProcessing(true)
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

      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await fetchBalances()

      setAmountToFund(null)
      setAmountToFundDisplay('')
      setAmountToFundNormalized(null)
      setMessage(`Successfully deposited ${formatNumber(fundsAmount)} ${displayCollateral.symbol}`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setTxState(TransactionStep.error)
      setMessage(`Error trying to deposit funds.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
  }

  const removeFunding = async () => {
    try {
      if (!cpk) {
        return
      }

      let fundsAmount = formatBigNumber(depositedTokensTotal, collateral.decimals, collateral.decimals)
      if (
        compoundService &&
        collateralSymbol in CompoundTokenType &&
        displayCollateral.symbol === baseCollateral.symbol
      ) {
        const displayDepositedTokensTotal = compoundService.calculateCTokenToBaseExchange(
          baseCollateral,
          depositedTokensTotal,
        )
        fundsAmount = formatBigNumber(
          displayDepositedTokensTotal || Zero,
          displayCollateral.decimals,
          displayCollateral.decimals,
        )
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

      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionProcessing(true)
      setIsTransactionModalOpen(true)
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
      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await fetchBalances()

      setAmountToRemove(null)
      setAmountToRemoveDisplay('')
      setAmountToRemoveNormalized(null)
      setMessage(`Successfully withdrew ${formatNumber(fundsAmount)} ${displayCollateral.symbol}`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setTxState(TransactionStep.error)
      setMessage(`Error trying to withdraw funds.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
  }

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()

    setAllowanceFinished(true)
  }

  const upgradeProxy = async () => {
    if (!cpk) {
      return
    }

    await updateProxy()
    setUpgradeFinished(true)
  }

  const collateralAmountError = isTransactionProcessing
    ? null
    : maybeCollateralBalance === null
    ? null
    : maybeCollateralBalance.isZero() && amountToFund?.gt(maybeCollateralBalance)
    ? `Insufficient balance`
    : amountToFund?.gt(maybeCollateralBalance)
    ? `Value must be less than or equal to ${walletBalance} ${collateral.symbol}`
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

  let displayBalances = balances
  if (compoundService && collateral.symbol.toLowerCase() in CompoundTokenType) {
    displayBalances = getSharesInBaseToken(balances, compoundService, displayCollateral)
  }
  const shouldDisplayMaxButton = collateral.address !== pseudoNativeAssetAddress

  let displayTotalUserLiquidity = totalUserLiquidity
  let displayUserEarnings = userEarnings
  let displayTotalEarnings = totalEarnings
  let displayPoolTokens = poolTokens
  let displayTotalPoolShares = totalPoolShares
  let displaySharesAfterAddingFunding = sharesAfterAddingFunding
  let displaySharesAfterRemovingFunding = sharesAfterRemovingFunding
  let displayFundingBalance = fundingBalance
  let displaySharesBalance = sharesBalance
  let sellNoteUserEarnings = userEarnings
  let sellNoteDepositedTokens = depositedTokens
  let sellNoteDepositedTokensTotal = depositedTokensTotal
  // Set display values if the collateral is cToken type
  if (compoundService && collateralSymbol in CompoundTokenType) {
    displayPoolTokens = compoundService.calculateCTokenToBaseExchange(baseCollateral, poolTokens)
    displayTotalPoolShares = compoundService.calculateCTokenToBaseExchange(baseCollateral, totalPoolShares)
    displayTotalUserLiquidity = compoundService.calculateCTokenToBaseExchange(displayCollateral, totalUserLiquidity)
    displayUserEarnings = compoundService.calculateCTokenToBaseExchange(displayCollateral, userEarnings)
    displayTotalEarnings = compoundService.calculateCTokenToBaseExchange(displayCollateral, totalEarnings)
    displayFundingBalance = compoundService.calculateCTokenToBaseExchange(baseCollateral, fundingBalance)
    displaySharesAfterAddingFunding = sharesAfterAddingFunding.map(function(saf) {
      return compoundService.calculateCTokenToBaseExchange(baseCollateral, saf)
    })
    displaySharesAfterRemovingFunding = sharesAfterRemovingFunding.map(function(srf) {
      return compoundService.calculateCTokenToBaseExchange(baseCollateral, srf)
    })
    const sharesBalanceBN = compoundService.calculateCTokenToBaseExchange(baseCollateral, fundingBalance)
    displaySharesBalance = formatBigNumber(sharesBalanceBN, baseCollateral.decimals)
    if (displayCollateral.address === baseCollateral.address) {
      sellNoteUserEarnings = displayUserEarnings
      sellNoteDepositedTokens = compoundService.calculateCTokenToBaseExchange(baseCollateral, depositedTokens)
      sellNoteDepositedTokensTotal = compoundService.calculateCTokenToBaseExchange(baseCollateral, depositedTokensTotal)
    }
  }

  const sharesAmountError = isTransactionProcessing
    ? null
    : maybeFundingBalance === null
    ? null
    : maybeFundingBalance.isZero() && amountToRemove?.gt(maybeFundingBalance)
    ? `Insufficient balance`
    : amountToRemoveNormalized?.gt(displayFundingBalance)
    ? `Value must be less than or equal to ${displaySharesBalance} pool shares`
    : null

  const disableWithdrawButton =
    !amountToRemove ||
    amountToRemove?.isZero() ||
    amountToRemoveNormalized?.gt(displayFundingBalance) ||
    sharesAmountError !== null ||
    isNegativeAmountToRemove

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
>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f
  const switchTab = (tab: Tabs) => {
    setAmountToFund(new BigNumber('0'))
    setAmountToRemove(new BigNumber('0'))
    setActiveTab(tab)
  }

<<<<<<< HEAD
=======
  const currencySelectorIsDisabled = relay ? true : currencyFilters.length ? false : true

  const disableWithdrawTab = activeTab !== Tabs.withdraw && isDust(totalUserLiquidity, collateral.decimals)

>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f
  return (
    <>
      <UserPoolData
        collateral={collateral}
        symbol={collateral.symbol}
        totalEarnings={totalEarnings}
        totalPoolShares={totalPoolShares}
        totalUserLiquidity={totalUserLiquidity}
        userEarnings={userEarnings}
      />
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
              onClick={() => switchTab(Tabs.deposit)}
            >
              Deposit
            </ButtonTab>
            <ButtonTab
              active={disableDepositTab ? true : activeTab === Tabs.withdraw}
              disabled={disableWithdrawTab}
              onClick={() => switchTab(Tabs.withdraw)}
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
                symbol=""
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
      <BottomButtonWrapper borderTop>
        <Button
          buttonType={ButtonType.secondaryLine}
          onClick={() => (history.length > 2 ? history.goBack() : history.replace('/liquidity'))}
        >
          Back
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

export const MarketPoolLiquidity = withRouter(MarketPoolLiquidityWrapper)
