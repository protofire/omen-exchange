import { stripIndents } from 'common-tags'
import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
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
import { computeBalanceAfterTrade, formatBigNumber, mulBN } from '../../../../util/tools'
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
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [tweet, setTweet] = useState('')

  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amount))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  // get the amount of shares that will be traded and the estimated prices after trade
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[], BigNumber]> => {
      const tradedShares = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)

      return [tradedShares, probabilities, amount]
    },
    [balances, marketMaker, outcomeIndex],
  )

  const [tradedShares, probabilities, debouncedAmount] = useAsyncDerivedValue(
    amount,
    [new BigNumber(0), balances.map(() => 0), amount],
    calcBuyAmount,
  )

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
        stripIndents(`${question.title}

      I predict ${balances[outcomeIndex].outcomeName}

      What do you think?`),
      )

      setAmount(new BigNumber(0))
      setStatus(Status.Ready)
      setMessage(`Successfully bought ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to buy '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const goBackToAddress = `/${marketMakerAddress}`

  const isBuyAmountGreaterThanBalance = amount.gt(collateralBalance)
  const isDisabled =
    (status !== Status.Ready && status !== Status.Error) ||
    isBuyAmountGreaterThanBalance ||
    amount.isZero() ||
    hasEnoughAllowance !== Ternary.True
  const showSetAllowance =
    allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False

  const feePaid = mulBN(debouncedAmount, MARKET_FEE / 100)
  const baseCost = debouncedAmount.sub(feePaid)
  const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount)

  const currentBalance = `${formatBigNumber(collateralBalance, collateral.decimals)} ${collateral.symbol}`
  const feeFormatted = `${formatBigNumber(feePaid.mul(-1), collateral.decimals)} ${collateral.symbol}`
  const baseCostFormatted = `${formatBigNumber(baseCost, collateral.decimals)} ${collateral.symbol}`
  const potentialProfitFormatted = `${formatBigNumber(potentialProfit, collateral.decimals)} ${collateral.symbol}`
  const sharesTotal = formatBigNumber(tradedShares, collateral.decimals)
  const total = `${sharesTotal} Shares`

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
          showSharesAndPriceChange={amount.gt(0)}
        />
        <GridTransactionDetails>
          <div>
            <WalletBalance
              data-class="customTooltip"
              data-delay-hide="500"
              data-effect="solid"
              data-for="walletBalanceTooltip"
              data-multiline={true}
              data-place="right"
              data-tip={`Spend your total ${collateral.symbol} balance on the selected outcome.`}
              onClick={() => setAmount(collateralBalance)}
              value={currentBalance}
            />
            <ReactTooltip id="walletBalanceTooltip" />
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  decimals={collateral.decimals}
                  name="amount"
                  onChange={(e: BigNumberInputReturn) => setAmount(e.value)}
                  value={amount}
                />
              }
              symbol={collateral.symbol}
            />
          </div>
          <div>
            <TransactionDetailsCard>
              <TransactionDetailsRow title={'Fee'} value={feeFormatted} />
              <TransactionDetailsRow title={'Base Cost'} value={baseCostFormatted} />
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
          <Button buttonType={ButtonType.secondaryLine} disabled={isDisabled} onClick={() => finish()}>
            Buy
          </Button>
        </ButtonContainer>
      </ViewCard>
      <ModalTransactionResult
        goBackToAddress={goBackToAddress}
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
