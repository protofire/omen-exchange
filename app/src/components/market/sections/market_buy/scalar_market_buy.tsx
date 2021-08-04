import { stripIndents } from 'common-tags'
import { Zero } from 'ethers/constants'
import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { STANDARD_DECIMALS } from '../../../../common/constants'
import { SharedPropsInterface } from '../../../../pages/market_sections/market_buy_container'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import { bigNumberToString, calcXValue, getUnit } from '../../../../util/tools'
import { MarketDetailsTab, MarketMakerData, Status, TransactionStep } from '../../../../util/types'
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
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  border-top: 1px solid ${props => props.theme.borders.borderDisabled};
  margin-left: -25px;
  margin-right: -25px;
  padding-left: 25px;
  padding-right: 25px;
`

const logger = getLogger('Scalar Market::Buy')

interface Props {
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  sharedProps: SharedPropsInterface
}

export const ScalarMarketBuy = (props: Props) => {
  const { fetchGraphMarketMakerData, fetchGraphMarketUserTxData, marketMakerData, sharedProps, switchMarketTab } = props
  const {
    allowance,
    allowanceFinished,
    amount,
    amountDisplay,
    amountError,
    baseCostFormatted,
    collateral,
    collateralBalance,
    context,
    cpk,
    displayFundAmount,
    feeFormatted,
    feePaid,
    feePercentage,
    fetchBalances,
    fetchCollateralBalance,
    initialCollateral,
    isBuyDisabled,
    isNegativeAmount,
    isTransactionModalOpen,
    marketMaker,
    outcomeIndex: positionIndex,
    potentialProfit,
    potentialProfitFormatted,
    probabilitiesOrNewPrediction: newPrediction,
    proxyIsUpToDate,
    setAmount,
    setAmountDisplay,
    setCollateral,
    setDisplayAmountToFund,
    setIsTransactionModalOpen,
    setOutcomeIndex: setPositionIndex,
    setStatus,
    setTxState,
    shouldDisplayMaxButton,
    showSetAllowance,
    showUpgrade,
    total,
    tradedShares,
    txHash,
    txState,
    unlockCollateral,
    upgradeFinished,
    upgradeProxy,
  } = sharedProps

  const {
    address: marketMakerAddress,
    balances,
    outcomeTokenMarginalPrices,
    question,
    scalarHigh,
    scalarLow,
  } = marketMakerData
  const [message, setMessage] = useState<string>('')
  const Tabs = {
    short: 'short',
    long: 'long',
  }

  const [activeTab, setActiveTab] = useState(Tabs.short)

  const [tweet, setTweet] = useState('')

  useEffect(() => {
    setCollateral(initialCollateral)
    setAmount(new BigNumber(0))
    setAmountDisplay('')
    // eslint-disable-next-line
  }, [marketMakerData.collateral.address])

  useEffect(() => {
    activeTab === Tabs.short ? setPositionIndex(0) : setPositionIndex(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, Tabs.short])

  const walletBalance = bigNumberToString(collateralBalance, collateral.decimals, 5)

  const formattedNewPrediction =
    newPrediction &&
    calcXValue(
      parseUnits(newPrediction.toString(), STANDARD_DECIMALS),
      scalarLow || new BigNumber(0),
      scalarHigh || new BigNumber(0),
    ) / 100

  const potentialLossFormatted = `${bigNumberToString(amount, collateral.decimals)} ${collateral.symbol}`

  const finish = async () => {
    const outcomeIndex = positionIndex
    try {
      if (!cpk) {
        return
      }

      const sharesAmount = bigNumberToString(tradedShares, collateral.decimals)
      setTweet('')
      setStatus(Status.Loading)
      setMessage(`Buying ${sharesAmount} shares...`)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)

      await cpk.buyOutcomes({
        amount: amount || Zero,
        collateral,
        outcomeIndex,
        marketMaker,
      })

      await fetchGraphMarketUserTxData()
      await fetchGraphMarketMakerData()
      await fetchCollateralBalance()
      await fetchBalances()

      setTweet(
        stripIndents(`${question.title}

      I predict ${balances[outcomeIndex].outcomeName}

      What do you think?`),
      )
      setDisplayAmountToFund(new BigNumber('0'))
      setAmount(new BigNumber(0))
      setStatus(Status.Ready)
      setMessage(`Successfully bought ${sharesAmount} ${balances[outcomeIndex].outcomeName} shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setTxState(TransactionStep.error)
      setMessage(`Error trying to buy '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
    }
  }

  return (
    <>
      <MarketScale
        amountShares={tradedShares}
        borderTop={true}
        collateral={collateral}
        currentPrediction={outcomeTokenMarginalPrices[1]}
        fee={feePaid}
        long={activeTab === Tabs.long}
        lowerBound={scalarLow || new BigNumber(0)}
        newPrediction={formattedNewPrediction}
        short={activeTab === Tabs.short}
        startingPointTitle={'Current prediction'}
        tradeAmount={amount}
        unit={getUnit(question.title)}
        upperBound={scalarHigh || new BigNumber(0)}
      />
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
              addBalances
              addNativeAsset
              balance={walletBalance}
              context={context}
              currency={collateral.address}
              disabled
            />
          </CurrenciesWrapper>
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setDisplayAmountToFund(e.value.gt(Zero) ? e.value : Zero)
                  setAmountDisplay('')
                }}
                style={{ width: 0 }}
                value={displayFundAmount}
                valueToDisplay={amountDisplay}
              />
            }
            onClickMaxButton={() => {
              setDisplayAmountToFund(collateralBalance)
              setAmountDisplay(bigNumberToString(collateralBalance, collateral.decimals, 5, true))
            }}
            shouldDisplayMaxButton={shouldDisplayMaxButton}
            symbol={collateral.symbol}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Base Cost'} value={baseCostFormatted} />
            <TransactionDetailsRow
              title={'Fee'}
              tooltip={`A ${feePercentage}% fee goes to liquidity providers`}
              value={feeFormatted}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow title={'Max. Loss'} value={potentialLossFormatted} />
            <TransactionDetailsRow
              emphasizeValue={potentialProfit.gt(0)}
              state={ValueStates.success}
              title={'Max. Profit'}
              value={potentialProfitFormatted}
            />
            <TransactionDetailsRow title={'Total'} value={total} />
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
        />
      )}
      {showSetAllowance && (
        <SetAllowance
          collateral={collateral}
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockCollateral}
          style={{ marginBottom: 20 }}
        />
      )}
      {showUpgrade && (
        <SetAllowance
          finished={upgradeFinished && RemoteData.is.success(proxyIsUpToDate)}
          loading={RemoteData.is.asking(proxyIsUpToDate)}
          onUnlock={upgradeProxy}
          style={{ marginBottom: 20 }}
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
        <Button buttonType={ButtonType.primary} disabled={isBuyDisabled} onClick={finish}>
          Buy Position
        </Button>
      </StyledButtonContainer>
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        isOpen={isTransactionModalOpen}
        message={message}
        onClose={() => setIsTransactionModalOpen(false)}
        shareUrl={`${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`}
        tweet={tweet}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}
