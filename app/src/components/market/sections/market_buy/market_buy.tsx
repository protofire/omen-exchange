import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { MARKET_FEE } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { useAsyncDerivedValue } from '../../../../hooks/useAsyncDerivedValue'
import { useCollateralBalance } from '../../../../hooks/useCollateralBalance'
import { useContracts } from '../../../../hooks/useContracts'
import { useCpk } from '../../../../hooks/useCpk'
import { useCpkAllowance } from '../../../../hooks/useCpkAllowance'
import { MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import { computeBalanceAfterTrade, formatBigNumber } from '../../../../util/tools'
import { MarketMakerData, OutcomeTableValue, Status, Ternary } from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { SectionTitle, TextAlign } from '../../../common/text/section_title'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketTopDetails } from '../../common/market_top_details'
import { OutcomeTable } from '../../common/outcome_table'
import { SetAllowance } from '../../common/set_allowance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { ViewCard } from '../../common/view_card'
import { WalletBalance } from '../../common/wallet_balance'

const LeftButton = styled(Button)`
  margin-right: auto;
`

const logger = getLogger('Market::Buy')

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
}

const MarketBuyWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const cpk = useCpk()
  const { library: provider } = context
  const signer = useMemo(() => provider.getSigner(), [provider])

  const { buildMarketMaker } = useContracts(context)
  const { marketMakerData } = props
  const { address: marketMakerAddress, balances, collateral, question } = marketMakerData
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setModalTransactionResultOpen] = useState(false)
  const [tweet, setTweet] = useState('')
  const [transactionResult, setTransactionResult] = useState('')

  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amount))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  // get the amount of shares that will be traded and the estimated prices after trade
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[]]> => {
      const tradedShares = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)

      return [tradedShares, probabilities]
    },
    [balances, marketMaker, outcomeIndex],
  )

  const [tradedShares, probabilities] = useAsyncDerivedValue(
    amount,
    [new BigNumber(0), balances.map(() => 0)],
    calcBuyAmount,
  )

  useEffect(() => {
    const valueNumber = +ethers.utils.formatUnits(amount, collateral.decimals)

    const weiPerUnit = ethers.utils.bigNumberify(10).pow(collateral.decimals)
    const marketFeeWithTwoDecimals = MARKET_FEE / Math.pow(10, 2)
    const costWithFee = ethers.utils
      .bigNumberify('' + Math.round(valueNumber * (1 + marketFeeWithTwoDecimals) * 10000)) // cast to string to avoid overflows
      .mul(weiPerUnit)
      .div(10000)
    setCost(costWithFee)
  }, [amount, collateral.decimals])

  const collateralBalance = useCollateralBalance(collateral, context)

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()
    setAllowanceFinished(true)
  }

  const finish = async () => {
    try {
      if (!cpk) {
        return
      }

      const sharesAmount = formatBigNumber(tradedShares, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Buying ${sharesAmount} shares ...`)

      await cpk.buyOutcomes({
        amount,
        outcomeIndex,
        marketMaker,
      })

      setTweet(
        `${question.title}

        I predict ${balances[outcomeIndex].outcomeName}

        What do you think?`,
      )

      setAmount(new BigNumber(0))
      setStatus(Status.Ready)

      setTransactionResult(`Successfully bought ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)

      setModalTransactionResultOpen(true)
    } catch (err) {
      setStatus(Status.Error)

      setTransactionResult(`Error trying to buy '${balances[outcomeIndex].outcomeName}' shares.`)

      logger.log(`Error trying to buy: ${err.message}`)
    }
  }

  const isBuyAmountGreaterThanBalance = amount.gt(collateralBalance)

  const error =
    (status !== Status.Ready && status !== Status.Error) ||
    cost.isZero() ||
    isBuyAmountGreaterThanBalance ||
    amount.isZero() ||
    hasEnoughAllowance !== Ternary.True

  const noteAmount = `${formatBigNumber(collateralBalance, collateral.decimals)} ${collateral.symbol}`

  const amountFee = cost.sub(amount)
  const potentialProfitValue = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount)
  const fee = `${formatBigNumber(amountFee.mul(-1), collateral.decimals)} ${collateral.symbol}`
  const baseCost = `${formatBigNumber(amount.sub(amountFee), collateral.decimals)} ${collateral.symbol}`
  const potentialProfit = `${formatBigNumber(potentialProfitValue, collateral.decimals)} ${collateral.symbol}`
  const sharesTotal = formatBigNumber(tradedShares, collateral.decimals)
  const total = `${sharesTotal} Shares`

  const showSetAllowance =
    allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False
  const goBackToAddress = `/${marketMakerAddress}`

  return (
    <>
      <SectionTitle backTo={goBackToAddress} textAlign={TextAlign.left} title={question.title} />
      <ViewCard>
        <MarketTopDetails marketMakerData={marketMakerData} title="Purchase Outcome" toggleTitle="Pool Information" />
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.Payout, OutcomeTableValue.Outcome, OutcomeTableValue.Probability]}
          outcomeHandleChange={(value: number) => setOutcomeIndex(value)}
          outcomeSelected={outcomeIndex}
          probabilities={probabilities}
        />
        <GridTransactionDetails>
          <div>
            <WalletBalance value={noteAmount} />
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  decimals={collateral.decimals}
                  name="amount"
                  onChange={(e: BigNumberInputReturn) => setAmount(e.value)}
                  value={amount}
                />
              }
              placeholderText={collateral.symbol}
            />
          </div>
          <div>
            <TransactionDetailsCard>
              <TransactionDetailsRow title={'Fee'} value={fee} />
              <TransactionDetailsRow title={'Base Cost'} value={baseCost} />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={potentialProfitValue.gt(0)}
                state={ValueStates.success}
                title={'Potential Profit'}
                value={potentialProfit}
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
        {showSetAllowance && (
          <SetAllowance
            collateral={collateral}
            finished={allowanceFinished}
            loading={RemoteData.is.asking(allowance)}
            onUnlock={unlockCollateral}
          />
        )}
        <ButtonContainer>
          <LeftButton buttonType={ButtonType.secondaryLine} onClick={() => props.history.push(goBackToAddress)}>
            Cancel
          </LeftButton>
          <Button buttonType={ButtonType.secondaryLine} disabled={error} onClick={() => finish()}>
            Buy
          </Button>
        </ButtonContainer>
      </ViewCard>
      <ModalTransactionResult
        goBackToAddress={goBackToAddress}
        isOpen={isModalTransactionResultOpen}
        onClose={() => setModalTransactionResultOpen(false)}
        shareUrl={`${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`}
        status={status}
        text={transactionResult}
        title={'Buy Shares'}
        tweet={tweet}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const MarketBuy = withRouter(MarketBuyWrapper)
