import { stripIndents } from 'common-tags'
import { Zero } from 'ethers/constants'
import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { DOCUMENT_VALIDITY_RULES } from '../../../../common/constants'
import {
  useAsyncDerivedValue,
  useCollateralBalance,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
  useGraphMeta,
} from '../../../../hooks'
import { MarketMakerService } from '../../../../services'
import { CompoundService } from '../../../../services/compound_service'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, getToken, getWrapToken, pseudoNativeAssetAddress } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  getBaseTokenForCToken,
  mulBN,
  roundNumberStringToSignificantDigits,
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
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { CurrenciesWrapper, GenericError } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { OutcomeTable } from '../../common/outcome_table'
import { SetAllowance } from '../../common/set_allowance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

const WarningMessageStyled = styled(WarningMessage)`
  margin-top: 20px;
  margin-bottom: 0;
`

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  margin: 0 -24px;

  padding: 20px 24px 0;
  margin-top: ${({ theme }) => theme.borders.borderLineDisabled};
`

const logger = getLogger('Market::Buy')

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketBuyWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()
  const { account, library: provider, networkId } = context
  const { waitForBlockToSync } = useGraphMeta()
  const signer = useMemo(() => provider.getSigner(), [provider])

  const { buildMarketMaker } = useContracts(context)
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const { address: marketMakerAddress, balances, fee, question } = marketMakerData
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const [collateral, setCollateral] = useState<Token>(marketMakerData.collateral)
  const [compoundService, setCompoundService] = useState<CompoundService>(
    new CompoundService(collateral.address, collateral.symbol, provider, account),
  )
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
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [amount, setAmount] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [isNegativeAmount, setIsNegativeAmount] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [tweet, setTweet] = useState('')
  const [newShares, setNewShares] = useState<Maybe<BigNumber[]>>(null)
  const [displayFundAmount, setDisplayFundAmount] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amount || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : false

  useEffect(() => {
    setIsNegativeAmount(formatBigNumber(amount || Zero, collateral.decimals).includes('-'))
  }, [amount, collateral.decimals])

  useEffect(() => {
    const getResult = async () => {
      await compoundService.init()
      setCompoundService(compoundService)
    }
    if (collateral.symbol.toLowerCase() in CompoundTokenType) {
      getResult()
    }
    // eslint-disable-next-line
  }, [])
  useEffect(() => {
    setCollateral(marketMakerData.collateral)
    setAmount(null)
    setAmountToDisplay('')
    // eslint-disable-next-line
  }, [marketMakerData.collateral.address])

  let displayBalances = balances
  if (displayCollateral.address !== collateral.address) {
    displayBalances = balances.map(function(bal) {
      const cTokenPrecision = 8
      const cTokenWithPrecision = roundNumberStringToSignificantDigits(bal.currentPrice.toString(), cTokenPrecision - 2)
      const cTokenPriceAmount = parseUnits(cTokenWithPrecision, cTokenPrecision)
      let baseTokenPrice = compoundService.calculateCTokenToBaseExchange(displayCollateral, cTokenPriceAmount)
      baseTokenPrice = baseTokenPrice.mul(100000)
      const basePrice = formatBigNumber(baseTokenPrice, displayCollateral.decimals)
      const basePriceActual = Number(basePrice) / 100000
      return Object.assign({}, bal, {
        currentPrice: basePriceActual,
      })
    })
  }
  // get the amount of shares that will be traded and the estimated prices after trade
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[], number[], BigNumber]> => {
      let tradedShares: BigNumber
      const collateralSymbol = collateral.symbol.toLowerCase()
      let amountActual = amount
      if (displayCollateral.address !== collateral.address && collateralSymbol in CompoundTokenType) {
        amountActual = compoundService.calculateBaseToCTokenExchange(displayCollateral, amount)
      }
      try {
        tradedShares = await marketMaker.calcBuyAmount(amountActual, outcomeIndex)
      } catch {
        tradedShares = new BigNumber(0)
      }
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amountActual,
        tradedShares,
      )
      let pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)
      if (displayCollateral.address !== collateral.address && collateralSymbol in CompoundTokenType) {
        pricesAfterTrade = pricesAfterTrade.map(priceAfterTrade => {
          const cTokenDecimals = 8
          const priceAfterTradeBig = roundNumberStringToSignificantDigits(
            priceAfterTrade.toString(),
            cTokenDecimals - 2,
          )
          const priceAfterTradeBN = parseUnits(priceAfterTradeBig, cTokenDecimals)
          let priceAfterTradeBaseBN = compoundService.calculateCTokenToBaseExchange(
            displayCollateral,
            priceAfterTradeBN,
          )
          priceAfterTradeBaseBN = priceAfterTradeBaseBN.mul(1000)
          const priceAfterTradeBase = formatBigNumber(priceAfterTradeBaseBN, displayCollateral.decimals)
          const priceAfterTradeBaseActual = Number(priceAfterTradeBase) / 1000
          return priceAfterTradeBaseActual
        })
      }
      let displayProbabilities = probabilities
      if (displayCollateral.address !== collateral.address && collateralSymbol in CompoundTokenType) {
        displayProbabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)
      }
      setNewShares(
        balances.map((balance, i) => (i === outcomeIndex ? balance.shares.add(tradedShares) : balance.shares)),
      )

      return [tradedShares, probabilities, displayProbabilities, amountActual]
    },
    [balances, marketMaker, outcomeIndex, collateral.address, collateral.symbol, compoundService, displayCollateral],
  )
  const [tradedShares, probabilities, displayProbabilities, debouncedAmount] = useAsyncDerivedValue(
    displayFundAmount || Zero,
    [new BigNumber(0), balances.map(() => 0), balances.map(() => 0), amount],
    calcBuyAmount,
  )

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

  const finish = async () => {
    try {
      if (!cpk) {
        return
      }
      const sharesAmount = formatBigNumber(tradedShares, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Buying ${sharesAmount} shares ...`)

      let useBaseToken = false
      if (displayCollateral.address !== collateral.address && collateral.symbol.toLowerCase() in CompoundTokenType) {
        useBaseToken = true
      }

      const transaction = await cpk.buyOutcomes({
        amount: displayFundAmount || Zero,
        collateral,
        compoundService,
        outcomeIndex,
        marketMaker,
        useBaseToken,
      })

      if (transaction.blockNumber) {
        await waitForBlockToSync(transaction.blockNumber)
      }

      await fetchGraphMarketMakerData()
      await fetchCollateralBalance()

      setTweet(
        stripIndents(`${question.title}

      I predict ${balances[outcomeIndex].outcomeName}

      What do you think?`),
      )

      setAmount(null)
      setAmountToDisplay('')
      setStatus(Status.Ready)
      setMessage(`Successfully bought ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to buy '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const showSetAllowance =
    collateral.address !== pseudoNativeAssetAddress &&
    !cpk?.cpk.isSafeApp() &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  const feePaid = mulBN(debouncedAmount || Zero, Number(formatBigNumber(fee, 18, 4)))
  const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100
  const baseCost = debouncedAmount?.sub(feePaid)
  const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount || Zero)

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    displayCollateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const currentBalance = `${formatBigNumber(collateralBalance, displayCollateral.decimals, 5)}`
  let baseCostNormalized = baseCost
  let potentialProfitNormalized = potentialProfit
  let feePaidNormalized = feePaid
  if (collateral.address !== displayCollateral.address) {
    if (baseCost && baseCost.gt(0)) {
      baseCostNormalized = compoundService.calculateCTokenToBaseExchange(displayCollateral, baseCost)
    }
    if (potentialProfit && potentialProfit.gt(0)) {
      potentialProfitNormalized = compoundService.calculateCTokenToBaseExchange(displayCollateral, potentialProfit)
    }
    if (feePaid && feePaid.gt(0)) {
      feePaidNormalized = compoundService.calculateCTokenToBaseExchange(displayCollateral, feePaid)
    }
  }
  const feeFormatted = `${formatNumber(formatBigNumber(feePaidNormalized.mul(-1), displayCollateral.decimals))}
  ${displayCollateral.symbol}`
  const baseCostFormatted = `${formatNumber(formatBigNumber(baseCostNormalized || Zero, displayCollateral.decimals))} ${
    displayCollateral.symbol
  }`
  const potentialProfitFormatted = `${formatNumber(
    formatBigNumber(potentialProfitNormalized, displayCollateral.decimals),
  )} ${displayCollateral.symbol}`
  const sharesTotal = formatNumber(formatBigNumber(tradedShares, collateral.decimals))
  const total = `${sharesTotal} Shares`

  const amountError =
    maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero() && amount?.gt(maybeCollateralBalance)
      ? `Insufficient balance`
      : amount?.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${currentBalance} ${displayCollateral.symbol}`
      : null
  const isBuyDisabled =
    !amount ||
    (status !== Status.Ready && status !== Status.Error) ||
    amount?.isZero() ||
    (!cpk?.cpk.isSafeApp() && collateral.address !== pseudoNativeAssetAddress && hasEnoughAllowance !== Ternary.True) ||
    amountError !== null ||
    isNegativeAmount ||
    (!isUpdated && collateral.address === pseudoNativeAssetAddress)

  const wrapAddress = getWrapToken(networkId).address

  let currencyFilters =
    collateral.address === wrapAddress || collateral.address === pseudoNativeAssetAddress
      ? [wrapAddress, pseudoNativeAssetAddress.toLowerCase()]
      : []

  const collateralSymbol = collateral.symbol.toLowerCase()
  if (collateralSymbol in CompoundTokenType) {
    const baseCollateralSymbol = getBaseTokenForCToken(collateralSymbol) as KnownToken
    const baseCollateral = getToken(networkId, baseCollateralSymbol)
    if (baseCollateral.symbol.toLowerCase() === 'eth') {
      currencyFilters = [collateral.address, pseudoNativeAssetAddress.toLowerCase()]
    } else {
      currencyFilters = [collateral.address, baseCollateral.address]
    }
  }
  const switchOutcome = (value: number) => {
    setNewShares(
      displayBalances.map((balance, i) => (i === outcomeIndex ? balance.shares.add(tradedShares) : balance.shares)),
    )
    setOutcomeIndex(value)
  }

  const setDisplayAmountToFund = (value: BigNumber) => {
    const collateralSymbol = collateral.symbol.toLowerCase()
    if (collateral.address !== displayCollateral.address && collateralSymbol in CompoundTokenType) {
      const baseAmount = compoundService.calculateBaseToCTokenExchange(displayCollateral, value)
      setAmount(baseAmount)
    } else {
      setAmount(value)
    }
    setDisplayFundAmount(value)
  }

  const setBuyCollateral = (token: Token) => {
    if (token.address === pseudoNativeAssetAddress && !(collateral.symbol.toLowerCase() in CompoundTokenType)) {
      setCollateral(token)
      setDisplayCollateral(token)
    } else {
      setDisplayCollateral(token)
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
        displayProbabilities={displayProbabilities}
        newShares={newShares}
        outcomeHandleChange={(value: number) => switchOutcome(value)}
        outcomeSelected={outcomeIndex}
        probabilities={probabilities}
        showPriceChange={amount?.gt(0)}
        showSharesChange={amount?.gt(0)}
      />
      <WarningMessageStyled
        additionalDescription={'. Be aware that market makers may remove liquidity from the market at any time!'}
        description={
          "Before trading on a market, make sure that its outcome will be known by its resolution date and it isn't an"
        }
        href={DOCUMENT_VALIDITY_RULES}
        hyperlinkDescription={'invalid market'}
      />
      <GridTransactionDetails>
        <div>
          <CurrenciesWrapper>
            <CurrencySelector
              addNativeAsset
              balance={formatBigNumber(maybeCollateralBalance || Zero, displayCollateral.decimals, 5)}
              context={context}
              currency={displayCollateral.address}
              disabled={currencyFilters.length ? false : true}
              filters={currencyFilters}
              onSelect={(token: Token | null) => {
                if (token) {
                  setBuyCollateral(token)
                  setAmount(new BigNumber(0))
                  setDisplayAmountToFund(new BigNumber(0))
                }
              }}
            />
          </CurrenciesWrapper>
          <ReactTooltip id="walletBalanceTooltip" />

          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={displayCollateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setDisplayAmountToFund(e.value)
                  setAmountToDisplay('')
                }}
                style={{ width: 0 }}
                value={displayFundAmount}
                valueToDisplay={amountToDisplay}
              />
            }
            onClickMaxButton={() => {
              setDisplayAmountToFund(collateralBalance)
              setAmountToDisplay(formatBigNumber(collateralBalance, displayCollateral.decimals, 5))
            }}
            shouldDisplayMaxButton
            symbol={displayCollateral.symbol}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Base Cost'} value={baseCostFormatted} />
            <TransactionDetailsRow
              title={'Fee'}
              tooltip={`A ${feePercentage}% fee goes to liquidity providers.`}
              value={feeFormatted}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              emphasizeValue={potentialProfit.gt(0)}
              state={ValueStates.success}
              title={'Potential Profit'}
              value={potentialProfitFormatted}
            />
            <TransactionDetailsRow
              emphasizeValue={parseFloat(sharesTotal) > 0}
              state={(parseFloat(sharesTotal) > 0 && ValueStates.important) || ValueStates.normal}
              title={'Total'}
              value={total}
            />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>
      {isNegativeAmount && (
        <WarningMessage
          additionalDescription={''}
          danger={true}
          description={`Your buy amount should not be negative.`}
          href={''}
          hyperlinkDescription={''}
          marginBottom={!showSetAllowance}
        />
      )}
      {showSetAllowance && (
        <SetAllowance
          collateral={collateral}
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockCollateral}
        />
      )}
      {showUpgrade && (
        <SetAllowance
          collateral={getNativeAsset(context.networkId)}
          finished={upgradeFinished && RemoteData.is.success(proxyIsUpToDate)}
          loading={RemoteData.is.asking(proxyIsUpToDate)}
          onUnlock={upgradeProxy}
        />
      )}
      <StyledButtonContainer borderTop={true} marginTop={showSetAllowance || isNegativeAmount}>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.swap)}>
          Cancel
        </Button>
        <Button buttonType={ButtonType.secondaryLine} disabled={isBuyDisabled} onClick={() => finish()}>
          Buy
        </Button>
      </StyledButtonContainer>
      <ModalTransactionResult
        isOpen={isModalTransactionResultOpen}
        onClose={() => setIsModalTransactionResultOpen(false)}
        shareUrl={`${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`}
        status={status}
        text={message}
        title={status === Status.Error ? 'Transaction Error' : 'Buy Shares'}
        tweet={tweet}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const MarketBuy = withRouter(MarketBuyWrapper)
