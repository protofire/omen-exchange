import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { getLogger } from '../../../../util/logger'
import { formatBigNumber, formatNumber } from '../../../../util/tools'
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
import { CurrenciesWrapper } from '../../common/common_styled'
import { EthBalance } from '../../common/eth_balance'
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
`

const logger = getLogger('Market::Bond')

const MarketBondWrapper: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const {
    balances,
    question: { currentAnswerBond },
  } = marketMakerData

  const context = useConnectedWeb3Context()
  const { account, library: provider } = context

  const { realitio } = useContracts(context)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const probabilities = balances.map(balance => balance.probability)
  const [bondEthAmount, setBondEthAmount] = useState<BigNumber>(
    currentAnswerBond ? new BigNumber(currentAnswerBond).mul(2) : new BigNumber('10000000000000000'),
  )
  const [ethBalance, setEthBalance] = useState<BigNumber>(Zero)

  useEffect(() => {
    const fetchEthBalance = async () => {
      try {
        const balance = await provider.getBalance(account || '')
        setEthBalance(balance)
      } catch (error) {
        setEthBalance(Zero)
      }
    }
    if (account) {
      fetchEthBalance()
    }
  }, [account, provider])

  useEffect(() => {
    if (currentAnswerBond && !new BigNumber(currentAnswerBond).mul(2).eq(bondEthAmount)) {
      setBondEthAmount(new BigNumber(currentAnswerBond).mul(2))
    }
    // eslint-disable-next-line
  }, [currentAnswerBond])

  const bondOutcome = async () => {
    setModalTitle('Bond Outcome')

    try {
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }
      const answer = outcomeIndex >= balances.length ? INVALID_ANSWER_ID : new BigNumber(outcomeIndex).toHexString()
      logger.log(`Submit Answer questionId: ${marketMakerData.question.id}, answer: ${answer}`)
      await realitio.submitAnswer(marketMakerData.question.id, answer, bondEthAmount)
      await fetchGraphMarketMakerData()

      setStatus(Status.Ready)
      setMessage(
        `Successfully bonded ${formatBigNumber(bondEthAmount, TokenEthereum.decimals)}ETH on ${
          outcomeIndex < marketMakerData.question.outcomes.length
            ? marketMakerData.question.outcomes[outcomeIndex]
            : 'Invalid'
        }`,
      )
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to bond Eth.`)
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
          bondIndex !== outcomeIndex ? bond : { ...bond, bondedEth: bond.bondedEth.add(bondEthAmount) },
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
              <EthBalance value={`${formatNumber(formatBigNumber(ethBalance, TokenEthereum.decimals, 3), 3)}`} />
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
                  value={bondEthAmount}
                />
              }
              symbol={TokenEthereum.symbol}
            />
          </>
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Bond Amount"
              value={`${formatNumber(formatBigNumber(bondEthAmount, TokenEthereum.decimals))} ${TokenEthereum.symbol}`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Profit"
              value={`${formatNumber(formatBigNumber(currentAnswerBond || new BigNumber(0), 18))} ETH`}
            />

            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Loss"
              value={`${formatNumber(formatBigNumber(bondEthAmount, 18))} ETH`}
            />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>

      <BottomButtonWrapper>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.finalize)}>
          Back
        </Button>
        <Button buttonType={ButtonType.primary} onClick={() => bondOutcome()}>
          Bond ETH
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
