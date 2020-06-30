import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { MARKET_FEE } from '../../../../common/constants'
import { useAsyncDerivedValue, useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { CPKService, MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { calcSellAmountInCollateral, computeBalanceAfterTrade, formatBigNumber, mulBN } from '../../../../util/tools'
import { BalanceItem, MarketMakerData, OutcomeTableValue, Status } from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { SectionTitle, TextAlign } from '../../../common/text/section_title'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { GenericError } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketTopDetailsOpen } from '../../common/market_top_details_open'
import { OutcomeTable } from '../../common/outcome_table'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { ViewCard } from '../../common/view_card'
import { WalletBalance } from '../../common/wallet_balance'

const LeftButton = styled(Button)`
  margin-right: auto;
`

const logger = getLogger('Market::Sell')

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
}

const MarketSellWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { buildMarketMaker, conditionalTokens } = useContracts(context)

  const { marketMakerData } = props
  const { address: marketMakerAddress, balances, collateral, question } = marketMakerData

  let defaultOutcomeIndex: number = 0
  for(let i = 0; i < balances.length; i++) {
    const shares = parseInt(formatBigNumber(balances[i].shares, collateral.decimals))
    if(shares > 0) {
      defaultOutcomeIndex = i
      break
    }
  }

  const marketMaker = buildMarketMaker(marketMakerAddress)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(defaultOutcomeIndex)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(balances[outcomeIndex])
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)

  const marketFeeWithTwoDecimals = MARKET_FEE / Math.pow(10, 2)

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
        amountShares.mul(99999).div(100000), // because of some precision error, we need to multiply the amount by 0.99999
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

      return [probabilities, costFee, amountToSell, potentialValue]
    },
    [outcomeIndex, balances, marketFeeWithTwoDecimals],
  )

  const [probabilities, costFee, tradedCollateral, potentialValue] = useAsyncDerivedValue(
    amountShares,
    [balances.map(() => 0), null, null, null],
    calcSellAmount,
  )

  const finish = async () => {
    try {
      if (!tradedCollateral) {
        return
      }

      const sharesAmount = formatBigNumber(amountShares, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Selling ${sharesAmount} shares...`)

      const cpk = await CPKService.create(context.library)

      await cpk.sellOutcomes({
        amount: tradedCollateral,
        outcomeIndex,
        marketMaker,
        conditionalTokens,
      })

      setAmountShares(new BigNumber(0))
      setStatus(Status.Ready)
      setMessage(`Successfully sold ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to sell '${balances[outcomeIndex].outcomeName}' shares.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const selectedOutcomeBalance = `${formatBigNumber(balanceItem.shares, collateral.decimals)}`
  const goBackToAddress = `/${marketMakerAddress}`

  const amountError = balanceItem.shares.isZero()
    ? `Insufficient balance`
    : amountShares.gt(balanceItem.shares)
    ? `Value must be less than or equal to ${selectedOutcomeBalance} shares`
    : null

  const isSellButtonDisabled =
    (status !== Status.Ready && status !== Status.Error) || amountShares.isZero() || amountError !== null

  return (
    <>
      <SectionTitle backTo={goBackToAddress} textAlign={TextAlign.left} title={question.title} />
      <ViewCard>
        <MarketTopDetailsOpen
          isLiquidityProvision={false}
          marketMakerData={marketMakerData}
          title="Sell Shares"
          toggleTitle="Pool Information"
        />
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.Payout, OutcomeTableValue.Outcome, OutcomeTableValue.Probability]}
          outcomeHandleChange={(value: number) => {
            setOutcomeIndex(value)
            setBalanceItem(balances[value])
          }}
          outcomeSelected={outcomeIndex}
          probabilities={probabilities}
          showPriceChange={amountShares.gt(0)}
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
              data-tip={`Sell all of the selected outcome's shares.`}
              onClick={() => setAmountShares(balanceItem.shares)}
              symbol="Shares"
              value={selectedOutcomeBalance}
            />
            <ReactTooltip id="walletBalanceTooltip" />
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  decimals={collateral.decimals}
                  name="amount"
                  onChange={(e: BigNumberInputReturn) => setAmountShares(e.value)}
                  value={amountShares}
                />
              }
              symbol={'Shares'}
            />
            {amountError && <GenericError>{amountError}</GenericError>}
          </div>
          <div>
            <TransactionDetailsCard>
              <TransactionDetailsRow
                title={'Sell Amount'}
                value={`${formatBigNumber(amountShares, collateral.decimals)} Shares`}
              />
              <TransactionDetailsRow
                emphasizeValue={potentialValue ? potentialValue.gt(0) : false}
                state={ValueStates.success}
                title={'Profit'}
                value={
                  potentialValue
                    ? `${formatBigNumber(potentialValue, collateral.decimals, 2)} ${collateral.symbol}`
                    : '0.00'
                }
              />
              <TransactionDetailsRow
                title={'Trading Fee'}
                value={`${costFee ? formatBigNumber(costFee.mul(-1), collateral.decimals, 2) : '0.00'} ${
                  collateral.symbol
                }`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={
                  (tradedCollateral && parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0) ||
                  false
                }
                state={
                  (tradedCollateral &&
                    parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0 &&
                    ValueStates.important) ||
                  ValueStates.normal
                }
                title={'Total'}
                value={`${tradedCollateral ? formatBigNumber(tradedCollateral, collateral.decimals, 2) : '0.00'} ${
                  collateral.symbol
                }`}
              />
            </TransactionDetailsCard>
          </div>
        </GridTransactionDetails>
        <ButtonContainer>
          <LeftButton buttonType={ButtonType.secondaryLine} onClick={() => props.history.push(goBackToAddress)}>
            Cancel
          </LeftButton>
          <Button buttonType={ButtonType.secondaryLine} disabled={isSellButtonDisabled} onClick={() => finish()}>
            Sell
          </Button>
        </ButtonContainer>
      </ViewCard>
      <ModalTransactionResult
        goBackToAddress={goBackToAddress}
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

export const MarketSell = withRouter(MarketSellWrapper)
