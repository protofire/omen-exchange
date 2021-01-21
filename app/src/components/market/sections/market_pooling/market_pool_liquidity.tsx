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
  useCpkProxy,
  useFundingBalance,
} from '../../../../hooks'
import { CompoundService } from '../../../../services/compound_service'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, getToken, getWrapToken, pseudoNativeAssetAddress } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcAddFundingSendAmounts,
  calcPoolTokens,
  calcRemoveFundingSendAmounts,
  formatBigNumber,
  formatNumber,
  getBaseTokenForCToken,
  getPricesInCToken,
  getSharesInBaseToken,
} from '../../../../util/tools'
import {
  CompoundTokenType,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Status,
  Ternary,
  Token,
} from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder, TitleValue } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
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

interface Props extends RouteComponentProps<any> {
  compoundService: CompoundService
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
const CurrencyDropdown = styled(Dropdown)`
  min-width: 80px;
  display: inline-flex;
  float: right;
`
const CustomDropdownItem = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  .dropdownItems & .sortBy {
    display: none;
  }
`
const CurrencyDropdownLabelContainer = styled.div`
  margin-top: 20px;
`
const CurrencyDropdownLabel = styled.div`
  display: inline-flex;
  padding-left: 14px;
  padding-top: 14px;
  color: ${({ theme }) => theme.colors.textColorDark};
  font-size: ${({ theme }) => theme.textfield.fontSize};
  font-weight: 400;
  line-height: 16px;
`

const logger = getLogger('Market::Fund')

const MarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  const { compoundService, fetchGraphMarketMakerData, marketMakerData } = props
  const { address: marketMakerAddress, balances, fee, totalEarnings, totalPoolShares, userEarnings } = marketMakerData
  const history = useHistory()
  const context = useConnectedWeb3Context()
  const { account, library: provider, networkId } = context
  const cpk = useConnectedCPKContext()

  const { buildMarketMaker, conditionalTokens } = useContracts(context)
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

  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const getInitialCollateral = (): Token => {
    const collateralSymbol = collateral.symbol.toLowerCase()
    if (collateralSymbol in CompoundTokenType) {
      const baseCollateralSymbol = getBaseTokenForCToken(collateralSymbol) as KnownToken
      const baseToken = getToken(networkId, baseCollateralSymbol)
      return baseToken
    } else {
      return collateral
    }
  }
  const [displayCollateral, setDisplayCollateral] = useState<Token>(getInitialCollateral())
  const [amountToFund, setAmountToFund] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToFundDisplay, setAmountToFundDisplay] = useState<string>('')
  const [isNegativeAmountToFund, setIsNegativeAmountToFund] = useState<boolean>(false)
  const [amountToRemove, setAmountToRemove] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveDisplay, setAmountToRemoveDisplay] = useState<string>('')
  const [isNegativeAmountToRemove, setIsNegativeAmountToRemove] = useState<boolean>(false)
  const [amountToFundNormalized, setAmountToFundNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveNormalized, setAmountToRemoveNormalized] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const collateralSymbol = collateral.symbol.toLowerCase()

  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)

  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true

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

  const feeFormatted = useMemo(() => `${formatBigNumber(fee.mul(Math.pow(10, 2)), 18)}%`, [fee])

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amountToFund || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())
  const poolTokens = calcPoolTokens(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  let displayPoolTokens = poolTokens
  let displayTotalPoolShares = totalPoolShares
  let baseCollateral = collateral
  if (collateral.symbol.toLowerCase() in CompoundTokenType) {
    const baseCollateralSymbol = getBaseTokenForCToken(collateral.symbol.toLowerCase()) as KnownToken
    baseCollateral = getToken(networkId, baseCollateralSymbol)
    displayPoolTokens = compoundService.calculateCTokenToBaseExchange(baseCollateral, displayPoolTokens)
    displayTotalPoolShares = compoundService.calculateCTokenToBaseExchange(baseCollateral, displayTotalPoolShares)
  }
  const sendAmountsAfterAddingFunding = calcAddFundingSendAmounts(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const sharesAfterAddingFunding = sendAmountsAfterAddingFunding
    ? balances.map((balance, i) => balance.shares.add(sendAmountsAfterAddingFunding[i]))
    : balances.map(balance => balance.shares)
  let displaySharesAfterAddingFunding = sharesAfterAddingFunding
  if (collateralSymbol in CompoundTokenType) {
    displaySharesAfterAddingFunding = sharesAfterAddingFunding.map(function(saf) {
      return compoundService.calculateCTokenToBaseExchange(baseCollateral, saf)
    })
  }
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
  let displaySharesAfterRemovingFunding = sharesAfterRemovingFunding
  if (collateralSymbol in CompoundTokenType) {
    displaySharesAfterRemovingFunding = sharesAfterRemovingFunding.map(function(srf) {
      return compoundService.calculateCTokenToBaseExchange(baseCollateral, srf)
    })
  }
  //console.log(sharesAfterRemovingFunding.toString())
  //console.log(displaySharesAfterRemovingFunding.toString())
  const showSharesChange = activeTab === Tabs.deposit ? amountToFund?.gt(0) : amountToRemove?.gt(0)

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    displayCollateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const probabilities = balances.map(balance => balance.probability)
  const showSetAllowance =
    collateral.address !== pseudoNativeAssetAddress &&
    !cpk?.cpk.isSafeApp() &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)
  const depositedTokensTotal = depositedTokens.add(userEarnings)
  const { fetchFundingBalance, fundingBalance: maybeFundingBalance } = useFundingBalance(marketMakerAddress, context)
  const fundingBalance = maybeFundingBalance || Zero
  let displayFundingBalance = fundingBalance
  if (collateral.symbol.toLowerCase() in CompoundTokenType) {
    displayFundingBalance = compoundService.calculateCTokenToBaseExchange(baseCollateral, fundingBalance)
  }
  const walletBalance = formatNumber(formatBigNumber(collateralBalance, displayCollateral.decimals, 5), 5)
  let sharesBalance = formatBigNumber(fundingBalance, collateral.decimals)
  if (collateral.symbol.toLowerCase() in CompoundTokenType) {
    const sharesBalanceBN = compoundService.calculateCTokenToBaseExchange(baseCollateral, fundingBalance)
    sharesBalance = formatBigNumber(sharesBalanceBN, baseCollateral.decimals)
  }
  const totalUserShareAmounts = calcRemoveFundingSendAmounts(
    fundingBalance,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const totalDepositedTokens = totalUserShareAmounts.reduce((min: BigNumber, amount: BigNumber) =>
    amount.lt(min) ? amount : min,
  )
  let totalUserLiquidity = totalDepositedTokens.add(userEarnings)
  let displayUserEarnings = userEarnings
  let displayDepositedTokens = depositedTokens
  let displayDepositedTokensTotal = depositedTokensTotal
  let displayTotalEarnings = totalEarnings
  if (collateral.address !== displayCollateral.address && collateral.symbol.toLowerCase() in CompoundTokenType) {
    displayDepositedTokens = compoundService.calculateCTokenToBaseExchange(displayCollateral, depositedTokens)
    totalUserLiquidity = compoundService.calculateCTokenToBaseExchange(displayCollateral, totalUserLiquidity)
    displayUserEarnings = compoundService.calculateCTokenToBaseExchange(displayCollateral, userEarnings)
    displayTotalEarnings = compoundService.calculateCTokenToBaseExchange(displayCollateral, totalEarnings)
    displayDepositedTokensTotal = compoundService.calculateCTokenToBaseExchange(displayCollateral, depositedTokensTotal)
  }
  let symbol = collateral.address === pseudoNativeAssetAddress ? wrapToken.symbol : collateral.symbol
  if (displayCollateral && displayCollateral.symbol) {
    symbol = displayCollateral.symbol
  }
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
        !cpk?.cpk.isSafeApp() &&
        collateral.address !== pseudoNativeAssetAddress &&
        hasEnoughAllowance !== Ternary.True
      ) {
        throw new Error("This method shouldn't be called if 'hasEnoughAllowance' is unknown or false")
      }

      const displayFundsAmount = formatBigNumber(amountToFundNormalized || Zero, displayCollateral.decimals)
      setStatus(Status.Loading)
      setMessage(`Depositing funds: ${displayFundsAmount} ${displayCollateral.symbol}...`)

      let useBaseToken = false
      if (displayCollateral.address !== collateral.address && collateral.symbol.toLowerCase() in CompoundTokenType) {
        useBaseToken = true
      }
      await cpk.addFunding({
        amount: amountToFundNormalized || Zero,
        compoundService,
        collateral,
        marketMaker,
        useBaseToken,
      })

      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()

      setStatus(Status.Ready)
      setAmountToFund(null)
      setAmountToFundDisplay('')
      setDisplayCollateralAmountToFund(new BigNumber(0))
      setMessage(`Successfully deposited ${displayFundsAmount} ${displayCollateral.symbol}`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to deposit funds.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const removeFunding = async () => {
    setModalTitle('Withdraw Funds')
    try {
      if (!cpk) {
        return
      }
      setStatus(Status.Loading)
      const fundsAmount = formatBigNumber(displayDepositedTokensTotal, displayCollateral.decimals)
      setMessage(`Withdrawing funds: ${fundsAmount} ${symbol}...`)
      const collateralAddress = await marketMaker.getCollateralToken()
      const conditionId = await marketMaker.getConditionId()
      let useBaseToken = false
      let normalizedAmountToMerge = depositedTokens
      let normalizedAmountToRemove = amountToRemove || Zero
      if (displayCollateral.address !== collateral.address) {
        useBaseToken = true
        normalizedAmountToMerge = compoundService.calculateBaseToCTokenExchange(baseCollateral, depositedTokens)
        normalizedAmountToRemove = compoundService.calculateBaseToCTokenExchange(
          baseCollateral,
          normalizedAmountToRemove,
        )
      }
      await cpk.removeFunding({
        amountToMerge: normalizedAmountToMerge,
        collateralAddress,
        compoundService,
        conditionId,
        conditionalTokens,
        earnings: userEarnings,
        marketMaker,
        outcomesCount: balances.length,
        sharesToBurn: normalizedAmountToRemove || Zero,
        useBaseToken,
      })
      await fetchGraphMarketMakerData()
      await fetchFundingBalance()
      await fetchCollateralBalance()

      setStatus(Status.Ready)
      setAmountToRemove(null)
      setAmountToRemoveDisplay('')
      setMessage(`Successfully withdrew ${fundsAmount} ${symbol}`)
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

  const collateralAmountError =
    maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero() && amountToFund?.gt(maybeCollateralBalance)
      ? `Insufficient balance`
      : amountToFund?.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${walletBalance} ${symbol}`
      : null

  const sharesAmountError =
    maybeFundingBalance === null
      ? null
      : maybeFundingBalance.isZero() && amountToRemove?.gt(maybeFundingBalance)
      ? `Insufficient balance`
      : amountToRemove?.gt(displayFundingBalance)
      ? `Value must be less than or equal to ${sharesBalance} pool shares`
      : null
  const setUserInputCollateral = (userInput: Token) => {
    setDisplayCollateral(userInput)
  }
  const disableDepositButton =
    !amountToFund ||
    amountToFund?.isZero() ||
    (!cpk?.cpk.isSafeApp() && collateral.address !== pseudoNativeAssetAddress && hasEnoughAllowance !== Ternary.True) ||
    collateralAmountError !== null ||
    currentDate > resolutionDate ||
    isNegativeAmountToFund

  const disableWithdrawButton =
    !amountToRemove ||
    amountToRemove?.isZero() ||
    amountToRemove?.gt(displayFundingBalance) ||
    sharesAmountError !== null ||
    isNegativeAmountToRemove

  let withdrawCurrencySelect = <span />
  let filterItems: Array<DropdownItemProps> = []
  if (collateralSymbol in CompoundTokenType) {
    const baseTokenSymbol = getBaseTokenForCToken(collateralSymbol)
    const baseToken = getToken(networkId, baseTokenSymbol as KnownToken)
    const filters = [
      {
        title: baseToken.symbol,
        onClick: () => {
          setAmountToRemoveNormalized(new BigNumber('0'))
          setUserInputCollateral(baseToken)
        },
      },
      {
        title: collateral.symbol,
        onClick: () => {
          setAmountToRemoveNormalized(new BigNumber('0'))
          setUserInputCollateral(collateral)
        },
      },
    ]
    filterItems = filters.map(item => {
      return {
        content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
        onClick: item.onClick,
      }
    })
    withdrawCurrencySelect = (
      <CurrencyDropdownLabelContainer>
        <CurrencyDropdownLabel>Withdraw as</CurrencyDropdownLabel>
        <CurrencyDropdown dropdownPosition={DropdownPosition.left} items={filterItems} />
      </CurrencyDropdownLabelContainer>
    )
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
    if (collateral.address === displayCollateral.address) {
      setAmountToFund(value)
    } else {
      const baseAmount = compoundService.calculateBaseToCTokenExchange(displayCollateral, value)
      setAmountToFund(baseAmount)
    }
    setAmountToFundNormalized(value)
  }

  const wrapAddress = wrapToken.address

  let currencyFilters =
    collateral.address === wrapAddress || collateral.address === pseudoNativeAssetAddress
      ? [wrapAddress, pseudoNativeAssetAddress.toLowerCase()]
      : []

  const shouldDisplayMaxButton = collateral.address !== pseudoNativeAssetAddress

  if (collateralSymbol in CompoundTokenType) {
    const baseCollateralSymbol = getBaseTokenForCToken(collateralSymbol) as KnownToken
    const baseCollateral = getToken(networkId, baseCollateralSymbol)
    if (baseCollateral.symbol.toLowerCase() === 'eth') {
      currencyFilters = [collateral.address, pseudoNativeAssetAddress.toLowerCase()]
    } else {
      currencyFilters = [collateral.address, baseCollateral.address]
    }
  }
  let displayBalances = balances
  if (collateral.symbol.toLowerCase() in CompoundTokenType) {
    displayBalances = getSharesInBaseToken(balances, compoundService, displayCollateral)
    if (collateral.symbol === displayCollateral.symbol) {
      displayBalances = getSharesInBaseToken(balances, compoundService, baseCollateral)
      displayBalances = getPricesInCToken(displayBalances, compoundService, baseCollateral)
    }
  }

  const setWithdrawAmountToRemove = (val: BigNumber) => {
    let normalizedWithdrawAmount = val
    if (collateral.symbol.toLowerCase() in CompoundTokenType && displayCollateral.address !== collateral.address) {
      normalizedWithdrawAmount = compoundService.calculateBaseToCTokenExchange(baseCollateral, normalizedWithdrawAmount)
    }
    setAmountToRemove(normalizedWithdrawAmount)
    setAmountToRemoveNormalized(val)
  }
  const switchTab = (tab: Tabs) => {
    if (collateralSymbol in CompoundTokenType) {
      setDisplayCollateral(baseCollateral)
    }
    setActiveTab(tab)
  }
  return (
    <>
      <UserData>
        <UserDataTitleValue
          title="Your Liquidity"
          value={`${formatNumber(formatBigNumber(totalUserLiquidity, displayCollateral.decimals))} ${
            displayCollateral.symbol
          }`}
        />
        <UserDataTitleValue
          title="Total Pool Tokens"
          value={`${formatNumber(formatBigNumber(displayTotalPoolShares, baseCollateral.decimals))}`}
        />
        <UserDataTitleValue
          state={displayUserEarnings.gt(0) ? ValueStates.success : undefined}
          title="Your Earnings"
          value={`${displayUserEarnings.gt(0) ? '+' : ''}${formatNumber(
            formatBigNumber(displayUserEarnings, displayCollateral.decimals),
          )} ${displayCollateral.symbol}`}
        />
        <UserDataTitleValue
          state={displayTotalEarnings.gt(0) ? ValueStates.success : undefined}
          title="Total Earnings"
          value={`${displayTotalEarnings.gt(0) ? '+' : ''}${formatNumber(
            formatBigNumber(displayTotalEarnings, displayCollateral.decimals),
          )} ${symbol}`}
        />
      </UserData>
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={[OutcomeTableValue.OutcomeProbability, OutcomeTableValue.Payout, OutcomeTableValue.Bonded]}
        displayBalances={displayBalances}
        displayCollateral={displayCollateral}
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
                      setAmountToFund(new BigNumber(0))
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
                  setDisplayCollateralAmountToFund(collateralBalance)
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
              <TokenBalance text="Pool Tokens" value={formatNumber(sharesBalance)} />

              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={displayCollateral.decimals}
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
                  setAmountToRemoveDisplay(formatBigNumber(displayFundingBalance, displayCollateral.decimals, 5))
                }}
                shouldDisplayMaxButton
                symbol=""
              />
              {withdrawCurrencySelect}
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
                value={`${formatNumber(formatBigNumber(displayUserEarnings, displayCollateral.decimals))} ${symbol}`}
              />
              <TransactionDetailsRow
                state={ValueStates.normal}
                title="Deposited"
                value={`${formatNumber(formatBigNumber(displayDepositedTokens, displayCollateral.decimals))} ${symbol}`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={depositedTokensTotal.gt(0)}
                state={(depositedTokensTotal.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Total"
                value={`${formatNumber(
                  formatBigNumber(displayDepositedTokensTotal, displayCollateral.decimals),
                )} ${symbol}`}
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
