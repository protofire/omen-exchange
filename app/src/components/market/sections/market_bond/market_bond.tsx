import { Zero } from 'ethers/constants'
import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, networkIds } from '../../../../util/networks'
import { formatBigNumber, formatNumber, numberToByte32 } from '../../../../util/tools'
import {
  INVALID_ANSWER_ID,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Status,
  TokenEthereum,
} from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { AssetBalance } from '../../common/asset_balance'
import { CurrenciesWrapper } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { OutcomeTable } from '../../common/outcome_table'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  theme?: any
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const BottomButtonWrapper = styled(ButtonContainer)`
  justify-content: space-between;
  margin: 0 -24px;
  padding: 20px 24px 0;
`

const logger = getLogger('Market::Bond')

const MarketBondWrapper: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const {
    balances,
    question: { currentAnswerBond },
  } = marketMakerData

  const context = useConnectedWeb3Context()
  const { account, library: provider, networkId } = context

  const nativeAsset = getNativeAsset(networkId)
  const symbol = nativeAsset.symbol
  const { realitio } = useContracts(context)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const probabilities = balances.map(balance => balance.probability)
  const initialBondAmount =
    networkId === networkIds.XDAI ? parseUnits('10', nativeAsset.decimals) : parseUnits('0.01', nativeAsset.decimals)
  const [bondNativeAssetAmount, setBondNativeAssetAmount] = useState<BigNumber>(
    currentAnswerBond ? new BigNumber(currentAnswerBond).mul(2) : initialBondAmount,
  )
  const [nativeAssetBalance, setNativeAssetBalance] = useState<BigNumber>(Zero)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await provider.getBalance(account || '')
        setNativeAssetBalance(balance)
      } catch (error) {
        setNativeAssetBalance(Zero)
      }
    }
    if (account) {
      fetchBalance()
    }
  }, [account, provider])

  useEffect(() => {
    if (currentAnswerBond && !new BigNumber(currentAnswerBond).mul(2).eq(bondNativeAssetAmount)) {
      setBondNativeAssetAmount(new BigNumber(currentAnswerBond).mul(2))
    }
    // eslint-disable-next-line
  }, [currentAnswerBond])

  const bondOutcome = async () => {
    setModalTitle('Bond Outcome')

    try {
      setStatus(Status.Loading)
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }

      const answer = outcomeIndex >= balances.length ? INVALID_ANSWER_ID : numberToByte32(outcomeIndex)

      setMessage(
        `Bonding ${formatBigNumber(bondNativeAssetAmount, TokenEthereum.decimals)} ${symbol} on: ${
          outcomeIndex >= marketMakerData.question.outcomes.length
            ? 'Invalid'
            : marketMakerData.question.outcomes[outcomeIndex]
        }`,
      )

      logger.log(`Submit Answer questionId: ${marketMakerData.question.id}, answer: ${answer}`, bondNativeAssetAmount)
      await realitio.submitAnswer(marketMakerData.question.id, answer, bondNativeAssetAmount)
      await fetchGraphMarketMakerData()

      setStatus(Status.Ready)
      setMessage(
        `Successfully bonded ${formatBigNumber(bondNativeAssetAmount, TokenEthereum.decimals)} ${symbol} on ${
          outcomeIndex < marketMakerData.question.outcomes.length
            ? marketMakerData.question.outcomes[outcomeIndex]
            : 'Invalid'
        }`,
      )
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to bond ${symbol}.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  return (
    <>
      <OutcomeTable
        balances={balances}
        bonds={marketMakerData.question.bonds}
        collateral={marketMakerData.collateral}
        disabledColumns={[
          OutcomeTableValue.OutcomeProbability,
          OutcomeTableValue.Probability,
          OutcomeTableValue.CurrentPrice,
          OutcomeTableValue.Payout,
        ]}
        isBond
        newBonds={marketMakerData.question.bonds?.map((bond, bondIndex) =>
          bondIndex !== outcomeIndex ? bond : { ...bond, bondedEth: bond.bondedEth.add(bondNativeAssetAmount) },
        )}
        outcomeHandleChange={(value: number) => {
          setOutcomeIndex(value)
        }}
        outcomeSelected={outcomeIndex}
        probabilities={probabilities}
        showBondChange
      />
      <GridTransactionDetails>
        <div>
          <>
            <CurrenciesWrapper>
              <AssetBalance
                asset={nativeAsset}
                value={`${formatNumber(formatBigNumber(nativeAssetBalance, TokenEthereum.decimals, 3), 3)}`}
              />
            </CurrenciesWrapper>

            <TextfieldCustomPlaceholder
              disabled
              formField={
                <BigNumberInput
                  decimals={TokenEthereum.decimals}
                  name="bondAmount"
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  onChange={() => {}}
                  style={{ width: 0 }}
                  value={bondNativeAssetAmount}
                />
              }
              symbol={symbol}
            />
          </>
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Bond Amount"
              value={`${formatNumber(formatBigNumber(bondNativeAssetAmount, TokenEthereum.decimals))} ${symbol}`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Profit"
              value={`${formatNumber(formatBigNumber(currentAnswerBond || new BigNumber(0), 18))} ${symbol}`}
            />

            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Loss"
              value={`${formatNumber(formatBigNumber(bondNativeAssetAmount, 18))} ${symbol}`}
            />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>

      <BottomButtonWrapper borderTop>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.finalize)}>
          Back
        </Button>
        <Button buttonType={ButtonType.primary} onClick={() => bondOutcome()}>
          Bond {symbol}
        </Button>
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

export const MarketBond = withRouter(MarketBondWrapper)
