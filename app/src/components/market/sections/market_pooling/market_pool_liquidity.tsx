import { useInterval } from '@react-corekit/use-interval'
import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { DOCUMENT_FAQ, FETCH_DETAILS_INTERVAL, GELATO_ACTIVATED } from '../../../../common/constants'
import {
  useCollateralBalance,
  useCompoundService,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
  useFundingBalance,
  useSymbol,
} from '../../../../hooks'
import { useGelatoSubmittedTasks } from '../../../../hooks/useGelatoSubmittedTasks'
import { ERC20Service } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import {
  getDefaultGelatoData,
  getNativeAsset,
  getToken,
  getWrapToken,
  pseudoNativeAssetAddress,
} from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcAddFundingSendAmounts,
  calcPoolTokens,
  calcRemoveFundingSendAmounts,
  formatBigNumber,
  formatNumber,
  getBaseTokenForCToken,
  getInitialCollateral,
  getSharesInBaseToken,
} from '../../../../util/tools'
import {
  CompoundTokenType,
  GelatoData,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Status,
  Ternary,
  Token,
} from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GelatoScheduler } from '../../common/gelato_scheduler'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { OutcomeTable } from '../../common/outcome_table'
import { SetAllowance } from '../../common/set_allowance'
import { SwitchTransactionToken } from '../../common/switch_transaction_token'
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

const logger = getLogger('Market::Fund')

const MarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData } = props

  const { address: marketMakerAddress, balances, fee, totalEarnings, totalPoolShares, userEarnings } = marketMakerData
  const history = useHistory()
  const context = useConnectedWeb3Context()
  const { account, library: provider, networkId } = context
  const cpk = useConnectedCPKContext()

  const { buildMarketMaker, conditionalTokens, gelato } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const signer = useMemo(() => provider.getSigner(), [provider])
  const [allowanceFinished, setAllowanceFinished] = useState(false)

  const wrapToken = getWrapToken(networkId)
  const nativeAsset = getNativeAsset(networkId)
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
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [displayCollateral, setDisplayCollateral] = useState<Token>(getInitialCollateral(context.networkId, collateral))
  const { allowance, unlock } = useCpkAllowance(signer, displayCollateral.address)
  let symbol = useSymbol(collateral)
  const collateralSymbol = collateral.symbol.toLowerCase()
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)
  const [amountToFundNormalized, setAmountToFundNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveNormalized, setAmountToRemoveNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))

  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true

  let baseCollateral = collateral
  if (collateralSymbol in CompoundTokenType) {
    if (collateralSymbol === 'ceth') {
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

  const feeFormatted = useMemo(() => `${formatBigNumber(fee.mul(Math.pow(10, 2)), 18)}%`, [fee])

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountToFund || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  // Gelato
  const { etherscanLink, refetch, submittedTaskReceiptWrapper, withdrawDate } = useGelatoSubmittedTasks(
    cpk ? cpk.address : null,
    marketMakerAddress,
    context,
  )

  useInterval(() => {
    if (refetch) refetch()
  }, FETCH_DETAILS_INTERVAL)

  useEffect(() => {
    if (refetch) refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const defaultGelatoData = getDefaultGelatoData(networkId)
  const [gelatoData, setGelatoData] = useState<GelatoData>(defaultGelatoData)
  const [belowGelatoMinimum, setBelowGelatoMinimum] = useState(false)
  const [gelatoMinimum, setGelatoMinimum] = useState<number>(0)

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

  const withGelato =
    (gelatoData.shouldSubmit && !submittedTaskReceiptWrapper) ||
    (gelatoData.shouldSubmit && submittedTaskReceiptWrapper && submittedTaskReceiptWrapper.status !== 'awaitingExec')
      ? true
      : false
  const sharesAfterRemovingFunding = balances.map((balance, i) => {
    return balance.shares.add(sendAmountsAfterRemovingFunding[i]).sub(depositedTokens)
  })

  const showSharesChange = activeTab === Tabs.deposit ? amountToFund?.gt(0) : amountToRemove?.gt(0)

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    displayCollateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const probabilities = balances.map(balance => balance.probability)
  const showSetAllowance =
    displayCollateral.address !== pseudoNativeAssetAddress &&
    !cpk?.isSafeApp &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)
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

  const totalDepositedTokens = totalUserShareAmounts.reduce((min: BigNumber, amount: BigNumber) =>
    amount.lt(min) ? amount : min,
  )

  const totalUserLiquidity = totalDepositedTokens.add(userEarnings)

  const symbol = collateral.address === pseudoNativeAssetAddress ? wrapToken.symbol : collateral.symbol
  const checkGelatoMinimum = useCallback(async () => {
    if (cpk && amountToFund) {
      const { belowMinimum, minimum } = await cpk.isBelowGelatoMinimum(
        amountToFund,
        collateral,
        gelato,
        totalUserLiquidity,
      )
      setBelowGelatoMinimum(belowMinimum)
      setGelatoMinimum(minimum)
    }
  }, [cpk, collateral, amountToFund, totalUserLiquidity, gelato])

  useEffect(() => {
    checkGelatoMinimum()
  }, [checkGelatoMinimum])

  const addFunding = async () => {
    setModalTitle('Deposit Funds')

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
      let fundsAmount = formatBigNumber(amountToFund || Zero, collateral.decimals)
      if (collateralSymbol in CompoundTokenType && displayCollateral.symbol === baseCollateral.symbol) {
        fundsAmount = formatBigNumber(amountToFundNormalized || Zero, displayCollateral.decimals)
      }
      setStatus(Status.Loading)
      withGelato && !belowGelatoMinimum
        ? setMessage(
            `Depositing funds: ${fundsAmount} ${symbol}\n
           and scheduling future auto-withdraw ${symbol} via Gelato Network`,
          )
        : setMessage(`Depositing funds: ${fundsAmount} ${symbol}...`)

      if (!cpk.cpk.isSafeApp() && collateral.address !== pseudoNativeAssetAddress) {
        const collateralAddress = await marketMaker.getCollateralToken()
        const collateralService = new ERC20Service(provider, account, collateralAddress)

        if (hasEnoughAllowance === Ternary.False) {
          await collateralService.approveUnlimited(cpk.address)
        }
      }

      const conditionId = await marketMaker.getConditionId()

      setIsTransactionProcessing(true)
      await cpk.addFunding({
        amount: amountToFund || Zero,
        priorCollateralAmount: totalUserLiquidity,
        compoundService,
        collateral,
        marketMaker,
        gelato,
        gelatoData,
        conditionalTokens,
        conditionId,
        submittedTaskReceiptWrapper,
        useBaseToken,
      })

      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await refetch()

      setAmountToFund(null)
      setAmountToFundDisplay('')
      setAmountToFundNormalized(null)
      setStatus(Status.Ready)
      setMessage(`Successfully deposited ${fundsAmount} ${displayCollateral.symbol}`)
      setIsTransactionProcessing(false)
      withGelato && !belowGelatoMinimum
        ? setMessage(`Successfully deposited ${fundsAmount} ${symbol}\n and scheduled auto-withdraw`)
        : setMessage(`Successfully deposited ${fundsAmount} ${symbol}`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to deposit funds.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
    setIsModalTransactionResultOpen(true)
  }

  const removeFunding = async () => {
    setModalTitle('Withdraw Funds')
    const withGelato =
      submittedTaskReceiptWrapper && submittedTaskReceiptWrapper.status === 'awaitingExec' ? true : false
    try {
      if (!cpk) {
        return
      }
      setStatus(Status.Loading)

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
      setMessage(`Withdrawing funds: ${fundsAmount} ${displayCollateral.symbol}...`)
      const fundsAmount = formatBigNumber(depositedTokensTotal, collateral.decimals)

      withGelato
        ? setMessage(`Withdrawing funds: ${fundsAmount} ${symbol}\n
        and cancel future auto-withdraw`)
        : setMessage(`Withdrawing funds: ${fundsAmount} ${symbol}...`)

      const collateralAddress = await marketMaker.getCollateralToken()
      const conditionId = await marketMaker.getConditionId()
      let useBaseToken = false
      if (displayCollateral.address === pseudoNativeAssetAddress) {
        useBaseToken = true
      } else if (collateral.symbol.toLowerCase() in CompoundTokenType) {
        if (displayCollateral.address !== collateral.address) {
          useBaseToken = true
        }
      }
      setIsTransactionProcessing(true)
      await cpk.removeFunding({
        amountToMerge: depositedTokens,
        collateralAddress,
        conditionId,
        conditionalTokens,
        compoundService,
        earnings: userEarnings,
        marketMaker,
        outcomesCount: balances.length,
        sharesToBurn: amountToRemove || Zero,
        useBaseToken,
        taskReceiptWrapper: submittedTaskReceiptWrapper,
        gelato,
      })
      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()
      await refetch()

      setAmountToRemove(null)
      setAmountToRemoveDisplay('')
      setAmountToRemoveNormalized(null)
      setStatus(Status.Ready)
      withGelato
        ? setMessage(`Successfully withdrew ${fundsAmount} ${symbol}\n and canceled auto-withdraw`)
        : setMessage(`Successfully withdrew ${fundsAmount} ${symbol}`)
      setIsModalTransactionResultOpen(true)
      setIsTransactionProcessing(false)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to withdraw funds.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
    setIsModalTransactionResultOpen(true)
  }

  const maxCollateralReturnAmount = (fundingBalance: BigNumber) => {
    const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(
      fundingBalance, // use instead of amountToRemove
      balances.map(b => b.holdings),
      totalPoolShares,
    )

    return sendAmountsAfterRemovingFunding.reduce((min: BigNumber, amount: BigNumber) =>
      amount.lt(min) ? amount : min,
    )
  }

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()

    setAllowanceFinished(true)
  }

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
    (!cpk?.isSafeApp && collateral.address !== pseudoNativeAssetAddress && hasEnoughAllowance !== Ternary.True) ||
    collateralAmountError !== null ||
    currentDate > resolutionDate ||
    isNegativeAmountToFund

  const setDisplayCollateralAmountToFund = (value: BigNumber) => {
    if (collateral.address === displayCollateral.address) {
      setAmountToFund(value)
    } else if (compoundService) {
      const baseAmount = compoundService.calculateBaseToCTokenExchange(displayCollateral, value)
      setAmountToFund(baseAmount)
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
  const switchTab = (tab: Tabs) => {
    if (collateralSymbol in CompoundTokenType) {
      setDisplayCollateral(baseCollateral)
    }
    setAmountToFund(new BigNumber('0'))
    setWithdrawAmountToRemove(new BigNumber('0'))
    setActiveTab(tab)
  }

  useEffect(() => {
    if (withdrawDate != null && (gelatoData.input == null || gelatoData.input.toString() != withdrawDate.toString())) {
      const gelatoDataCopy = { ...gelatoData, input: withdrawDate }
      setGelatoData(gelatoDataCopy)
    }
  }, [gelatoData, withdrawDate])

  return (
    <>
      <UserPoolData
        collateral={baseCollateral}
        symbol={symbol}
        totalEarnings={displayTotalEarnings}
        totalPoolShares={displayTotalPoolShares}
        totalUserLiquidity={displayTotalUserLiquidity}
        userEarnings={displayUserEarnings}
      />
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={[OutcomeTableValue.OutcomeProbability, OutcomeTableValue.Payout, OutcomeTableValue.Bonded]}
        displayBalances={displayBalances}
        displayCollateral={baseCollateral}
        displayRadioSelection={false}
        newShares={activeTab === Tabs.deposit ? displaySharesAfterAddingFunding : displaySharesAfterRemovingFunding}
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
                  currency={displayCollateral.address}
                  disabled={currencyFilters.length ? false : true}
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
                emphasizeValue={displayPoolTokens.gt(0)}
                state={(displayPoolTokens.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Pool Tokens"
                value={`${formatNumber(formatBigNumber(displayPoolTokens, baseCollateral.decimals))}`}
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
                  formatBigNumber(sellNoteUserEarnings, displayCollateral.decimals),
                )} ${displayTotalSymbol}`}
              />
              <TransactionDetailsRow
                state={ValueStates.normal}
                title="Deposited"
                value={`${formatNumber(
                  formatBigNumber(sellNoteDepositedTokens, displayCollateral.decimals),
                )} ${displayTotalSymbol}`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={sellNoteDepositedTokensTotal.gt(0)}
                state={(sellNoteDepositedTokensTotal.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Total"
                value={`${formatNumber(
                  formatBigNumber(sellNoteDepositedTokensTotal, displayCollateral.decimals),
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
          collateral={getNativeAsset(context.networkId)}
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
      {GELATO_ACTIVATED && (
        <GelatoScheduler
          belowMinimum={belowGelatoMinimum}
          collateralSymbol={collateral.symbol}
          collateralToWithdraw={`${formatBigNumber(maxCollateralReturnAmount(fundingBalance), collateral.decimals)}`}
          etherscanLink={etherscanLink ? etherscanLink : undefined}
          gelatoData={gelatoData}
          handleGelatoDataChange={setGelatoData}
          handleGelatoDataInputChange={(newDate: Date | null) => {
            const gelatoDataCopy = { ...gelatoData, input: newDate }
            setGelatoData(gelatoDataCopy)
          }}
          isScheduled={submittedTaskReceiptWrapper ? true : false}
          minimum={gelatoMinimum}
          resolution={resolutionDate !== null ? marketMakerData.question.resolution : new Date()}
          taskStatus={submittedTaskReceiptWrapper ? submittedTaskReceiptWrapper.status : undefined}
        />
      )}
      <BottomButtonWrapper borderTop>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => history.goBack()}>
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
