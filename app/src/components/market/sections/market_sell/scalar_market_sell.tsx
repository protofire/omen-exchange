import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useAsyncDerivedValue, useCollateralBalance, useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { CPKService, MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcSellAmountInCollateral,
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  mulBN,
} from '../../../../util/tools'
import { MarketMakerData, Status, Ternary } from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { WarningMessage } from '../../common/warning_message'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
`

const logger = getLogger('Scalar Market::Buy')

interface Props {
  fetchGraphMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketSell = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const context = useConnectedWeb3Context()
  const { library: provider } = context
  const signer = useMemo(() => provider.getSigner(), [provider])

  const {
    address: marketMakerAddress,
    balances,
    collateral,
    fee,
    outcomeTokenMarginalPrices,
    question,
    scalarHigh,
    scalarLow,
  } = marketMakerData
  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const Tabs = {
    short: 'short',
    long: 'long',
  }

  const [amountDisplay, setAmountDisplay] = useState<string>('')
  const [activeTab, setActiveTab] = useState(Tabs.short)
  const [isNegativeAmount, setIsNegativeAmount] = useState<boolean>(false)
  const [positionIndex, setPositionIndex] = useState(0)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [amountShares, setAmountShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountSharesToDisplay, setAmountSharesToDisplay] = useState<string>('')
  const [isNegativeAmountShares, setIsNegativeAmountShares] = useState<boolean>(false)

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const walletBalance = formatNumber(formatBigNumber(collateralBalance, collateral.decimals, 5), 5)

  const lowerBound = scalarLow && Number(formatBigNumber(scalarLow, 18))
  const upperBound = scalarHigh && Number(formatBigNumber(scalarHigh, 18))

  useEffect(() => {
    setIsNegativeAmountShares(formatBigNumber(amountShares || Zero, collateral.decimals).includes('-'))
  }, [amountShares, collateral.decimals])

  // useEffect(() => {
  //   setBalanceItem(balances[outcomeIndex])
  //   // eslint-disable-next-line
  // }, [balances[outcomeIndex]])

  // useEffect(() => {
  //   setOutcomeIndex(defaultOutcomeIndex)
  //   setBalanceItem(balances[defaultOutcomeIndex])
  //   setAmountShares(null)
  //   setAmountSharesToDisplay('')
  //   // eslint-disable-next-line
  // }, [collateral.address])

  useEffect(() => {
    activeTab === Tabs.short ? setPositionIndex(0) : setPositionIndex(1)
  }, [activeTab, Tabs.short])

  const marketFeeWithTwoDecimals = Number(formatBigNumber(fee, 18))

  const calcSellAmount = useMemo(
    () => async (
      amountShares: BigNumber,
    ): Promise<[Maybe<BigNumber>, Maybe<number>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      let tradedShares: BigNumber
      let reverseTradedShares: BigNumber

      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[positionIndex]
      const holdingsOfOtherOutcome = holdings.filter((item, index) => {
        return index !== positionIndex
      })

      const amountToSell = calcSellAmountInCollateral(
        // If the transaction incur in some precision error, we need to multiply the amount by some factor, for example  amountShares.mul(99999).div(100000) , bigger the factor, less dust
        amountShares,
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

      // try {
      //   tradedShares = await marketMaker.calcSellAmount(amount, positionIndex)
      //   reverseTradedShares = await marketMaker.calcSellAmount(amount, positionIndex === 0 ? 1 : 0)
      // } catch {
      //   tradedShares = new BigNumber(0)
      //   reverseTradedShares = new BigNumber(0)
      // }

      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        positionIndex,
        amountToSell.mul(-1),
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const potentialProfit = mulBN(amountToSell, 1 / (1 - marketFeeWithTwoDecimals))
      const costFee = potentialProfit.sub(amountToSell)

      const newPrediction = pricesAfterTrade[1] * ((upperBound || 0) - (lowerBound || 0)) + (lowerBound || 0)

      logger.log(`Amount to sell ${amountToSell}`)
      return [costFee, newPrediction, amountToSell, potentialProfit]
    },
    [balances, marketMaker, positionIndex, lowerBound, upperBound],
  )

  const [costFee, newPrediction, tradedCollateral, potentialProfit] = useAsyncDerivedValue(
    amountShares || Zero,
    [new BigNumber(0), 0, amountShares, new BigNumber(0)],
    calcSellAmount,
  )

  // const formattedNewPrediction =
  //   newPrediction && (newPrediction - (lowerBound || 0)) / ((upperBound || 0) - (lowerBound || 0))

  // const feePaid = mulBN(debouncedAmount, Number(formatBigNumber(fee, 18, 4)))
  // const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100

  // const baseCost = debouncedAmount.sub(feePaid)
  // const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount)
  // const potentialLossUncapped = reverseTradedShares.isZero()
  //   ? new BigNumber(0)
  //   : reverseTradedShares.sub(amount.add(feePaid))
  // const potentialLoss = reverseTradedShares.isZero()
  //   ? new BigNumber(0)
  //   : reverseTradedShares.sub(amount).lt(debouncedAmount)
  //   ? reverseTradedShares.sub(amount)
  //   : debouncedAmount

  const currentBalance = `${formatBigNumber(collateralBalance, collateral.decimals, 5)}`
  // const feeFormatted = `${formatNumber(formatBigNumber(feePaid.mul(-1), collateral.decimals))} ${collateral.symbol}`
  // const baseCostFormatted = `${formatNumber(formatBigNumber(baseCost, collateral.decimals))} ${collateral.symbol}`
  // const potentialProfitFormatted = `${formatNumber(formatBigNumber(potentialProfit, collateral.decimals))} ${
  //   collateral.symbol
  // }`
  // const potentialLossFormatted = `${formatNumber(formatBigNumber(potentialLoss, collateral.decimals))} ${
  //   collateral.symbol
  // }`
  // const sharesTotal = formatNumber(formatBigNumber(tradedShares, collateral.decimals))
  // const total = `${sharesTotal} Shares`

  const finish = async () => {
    const outcomeIndex = positionIndex
    try {
      if (!tradedCollateral) {
        return
      }

      const sharesAmount = formatBigNumber(amountShares || Zero, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Selling ${sharesAmount} shares ...`)

      const cpk = await CPKService.create(provider)

      await cpk.sellOutcomes({
        amount: tradedCollateral,
        conditionalTokens,
        marketMaker,
        outcomeIndex,
      })

      await fetchGraphMarketMakerData()
      await fetchCollateralBalance()

      setAmountShares(null)
      setAmountSharesToDisplay('')
      setStatus(Status.Ready)
      setMessage(`Successfully sold ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to sell '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  return (
    <>
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab active={activeTab === Tabs.short} onClick={() => setActiveTab(Tabs.short)}>
              Short
            </ButtonTab>
            <ButtonTab active={activeTab === Tabs.long} onClick={() => setActiveTab(Tabs.long)}>
              Long
            </ButtonTab>
          </TabsGrid>
          <CurrenciesWrapper>
            <CurrencySelector
              balance={walletBalance}
              context={context}
              currency={collateral.address}
              disabled
              onSelect={() => null}
            />
          </CurrenciesWrapper>
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmountShares(e.value)
                  setAmountSharesToDisplay('')
                }}
                style={{ width: 0 }}
                value={amountShares}
                valueToDisplay={amountSharesToDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmountShares(collateralBalance)
              setAmountSharesToDisplay(walletBalance)
            }}
            shouldDisplayMaxButton
            symbol={collateral.symbol}
          />
          {/* {amountError && <GenericError>{amountError}</GenericError>} */}
        </div>
      </GridTransactionDetails>
      {isNegativeAmount && (
        <WarningMessage
          additionalDescription={''}
          danger={true}
          description={`Your buy amount should not be negative.`}
          href={''}
          hyperlinkDescription={''}
        />
      )}
      <StyledButtonContainer>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab('SWAP')}>
          Cancel
        </Button>
        <Button buttonType={ButtonType.primaryAlternative} onClick={finish}>
          Sell Position
        </Button>
      </StyledButtonContainer>
      <ModalTransactionResult
        isOpen={isModalTransactionResultOpen}
        onClose={() => setIsModalTransactionResultOpen(false)}
        status={status}
        text={message}
        title={status === Status.Error ? 'Transaction Error' : 'Sell Shares'}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}
