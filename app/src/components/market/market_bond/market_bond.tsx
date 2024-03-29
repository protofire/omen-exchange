import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../contexts'
import { useContracts, useCpkProxy } from '../../../hooks'
import { getLogger } from '../../../util/logger'
import { getNativeAsset } from '../../../util/networks'
import { RemoteData } from '../../../util/remote_data'
import { bigNumberToString, getUnit, mulBN, numberToByte32 } from '../../../util/tools'
import {
  INVALID_ANSWER_ID,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  TransactionStep,
} from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../modal'
import { SetAllowance } from '../common_sections/allowance/set_allowance'
import { GridTransactionDetails } from '../common_sections/card_bottom_details/grid_transaction_details'
import { MarketScale } from '../common_sections/card_bottom_details/market_scale'
import { OutcomeTable } from '../common_sections/tables/outcome_table'
import { TransactionDetailsCard } from '../common_sections/user_transactions_tokens/transaction_details_card'
import { TransactionDetailsLine } from '../common_sections/user_transactions_tokens/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../common_sections/user_transactions_tokens/transaction_details_row'
import { CurrenciesWrapper, GenericError } from '../common_styled'

import { AssetBalance } from './asset_balance'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  theme?: any
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  isScalar: boolean
  bondNativeAssetAmount: BigNumber
}

const BottomButtonWrapper = styled(ButtonContainer)`
  margin: 0 -24px;
  padding: 20px 24px 0;
`

const logger = getLogger('Market::Bond')

const MarketBondWrapper: React.FC<Props> = (props: Props) => {
  const { bondNativeAssetAmount, fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props

  const {
    balances,
    question: { currentAnswerBond },
  } = marketMakerData

  const context = useConnectedWeb3Context()
  const { account, cpk, library: provider, networkId, relay, setTxState, txHash, txState } = context

  const nativeAsset = getNativeAsset(networkId, relay)
  const { symbol } = nativeAsset
  const { realitio } = useContracts(context)

  const [message, setMessage] = useState<string>('')
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const probabilities = balances.map(balance => balance.probability)
  const [bondOutcomeSelected, setBondOutcomeSelected] = useState<BigNumber>(Zero)
  const [bondOutcomeDisplay, setBondOutcomeDisplay] = useState<string>('')
  const [amountError, setAmountError] = useState<boolean>(false)

  const [nativeAssetBalance, setNativeAssetBalance] = useState<BigNumber>(Zero)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)

  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy(true)
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true
  const showUpgrade = !isUpdated || upgradeFinished

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await provider.getBalance(account || '')
        setAmountError(balance.lte(bondNativeAssetAmount))
        setNativeAssetBalance(balance)
      } catch (error) {
        setNativeAssetBalance(Zero)
      }
    }
    if (account) {
      fetchBalance()
    }
  }, [account, provider, bondNativeAssetAmount])

  const upgradeProxy = async () => {
    if (!cpk) {
      return
    }

    await updateProxy()
    setUpgradeFinished(true)
  }

  const bondOutcome = async (isInvalid?: boolean) => {
    if (!cpk) {
      return
    }

    try {
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }

      const answer =
        outcomeIndex >= balances.length || isInvalid
          ? INVALID_ANSWER_ID
          : numberToByte32(props.isScalar ? bondOutcomeSelected.toHexString() : outcomeIndex, props.isScalar)

      setMessage(
        `Bonding on ${
          outcomeIndex >= balances.length || isInvalid
            ? 'Invalid'
            : props.isScalar
            ? `${bigNumberToString(bondOutcomeSelected, nativeAsset.decimals)} ${getUnit(
                props.marketMakerData.question.title,
              )}`
            : marketMakerData.question.outcomes[outcomeIndex]
        } with ${bigNumberToString(bondNativeAssetAmount, nativeAsset.decimals)} ${symbol}`,
      )

      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)

      const question = marketMakerData.question
      logger.log(`Submit Answer questionId: ${question.id}, answer: ${answer}`, bondNativeAssetAmount)

      await cpk.submitAnswer({
        realitio,
        question,
        answer,
        amount: bondNativeAssetAmount,
      })

      await fetchGraphMarketMakerData()
      setBondOutcomeDisplay('0')
      setBondOutcomeSelected(Zero)
      setMessage(
        `Successfully bonded ${bigNumberToString(bondNativeAssetAmount, nativeAsset.decimals)} ${symbol} on ${
          outcomeIndex >= balances.length || isInvalid
            ? 'Invalid'
            : props.isScalar
            ? `${bigNumberToString(bondOutcomeSelected, nativeAsset.decimals)} ${getUnit(
                props.marketMakerData.question.title,
              )}`
            : marketMakerData.question.outcomes[outcomeIndex]
        }`,
      )
    } catch (err) {
      setTxState(TransactionStep.error)
      setMessage(`Error trying to bond ${symbol}.`)
      logger.error(`${message} - ${err.message}`)
    }
  }

  return (
    <>
      {props.isScalar ? (
        <MarketScale
          borderTop={true}
          collateral={props.marketMakerData.collateral}
          currentAnswer={props.marketMakerData.question.currentAnswer}
          currentAnswerBond={props.marketMakerData.question.currentAnswerBond}
          currentPrediction={
            props.marketMakerData.outcomeTokenMarginalPrices
              ? props.marketMakerData.outcomeTokenMarginalPrices[1]
              : null
          }
          currentTab={MarketDetailsTab.setOutcome}
          fee={props.marketMakerData.fee}
          isBonded={true}
          lowerBound={props.marketMakerData.scalarLow || new BigNumber(0)}
          startingPointTitle={'Current prediction'}
          unit={getUnit(props.marketMakerData.question.title)}
          upperBound={props.marketMakerData.scalarHigh || new BigNumber(0)}
        />
      ) : (
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
      )}
      <GridTransactionDetails>
        <div>
          <>
            <CurrenciesWrapper>
              <AssetBalance
                asset={nativeAsset}
                value={`${bigNumberToString(nativeAssetBalance, nativeAsset.decimals, 3)}`}
              />
            </CurrenciesWrapper>

            <TextfieldCustomPlaceholder
              disabled
              formField={
                <BigNumberInput
                  decimals={nativeAsset.decimals}
                  name="bondAmount"
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  onChange={() => {}}
                  style={{ width: 0 }}
                  value={bondNativeAssetAmount}
                />
              }
              symbol={symbol}
            />
            {props.isScalar && (
              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={nativeAsset.decimals}
                    name="bondAmount"
                    onChange={(e: BigNumberInputReturn) => {
                      setBondOutcomeSelected(e.value.gt(Zero) ? e.value : Zero)

                      setBondOutcomeDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={bondOutcomeSelected}
                    valueToDisplay={bondOutcomeDisplay}
                  />
                }
                style={{ marginTop: 20 }}
                symbol={getUnit(props.marketMakerData.question.title)}
              />
            )}
            {amountError && <GenericError>Insufficient funds to Bond</GenericError>}
          </>
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Bond Amount"
              value={`${bigNumberToString(bondNativeAssetAmount, nativeAsset.decimals)} ${symbol}`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Fee"
              tooltip="A 2.5% fee is applied and burned on bonds which are not the final bond."
              value={`${bigNumberToString(mulBN(bondNativeAssetAmount, 0.0025), nativeAsset.decimals, 3)} ${symbol}`}
            />
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Profit"
              value={`${bigNumberToString(currentAnswerBond || new BigNumber(0), STANDARD_DECIMALS)} ${symbol}`}
            />

            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Loss"
              value={`${bigNumberToString(bondNativeAssetAmount, STANDARD_DECIMALS)} ${symbol}`}
            />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>

      {showUpgrade && (
        <SetAllowance
          finished={upgradeFinished && RemoteData.is.success(proxyIsUpToDate)}
          loading={RemoteData.is.asking(proxyIsUpToDate)}
          onUnlock={upgradeProxy}
        />
      )}

      <BottomButtonWrapper borderTop marginTop={showUpgrade}>
        <Button
          buttonType={ButtonType.secondaryLine}
          onClick={() => switchMarketTab(MarketDetailsTab.finalize)}
          style={{ marginRight: 'auto' }}
        >
          Back
        </Button>
        {props.isScalar && (
          <Button buttonType={ButtonType.secondaryLine} disabled={amountError} onClick={() => bondOutcome(true)}>
            Set Invalid
          </Button>
        )}
        <Button buttonType={ButtonType.primary} disabled={amountError || !isUpdated} onClick={() => bondOutcome(false)}>
          Bond {symbol}
        </Button>
      </BottomButtonWrapper>
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        isOpen={isTransactionModalOpen}
        message={message}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const MarketBond = withRouter(MarketBondWrapper)
