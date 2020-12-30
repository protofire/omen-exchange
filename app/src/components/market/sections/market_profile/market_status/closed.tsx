import Big from 'big.js'
import { BigNumber, bigNumberify, parseUnits } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedCPKContext, useContracts } from '../../../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../../../hooks/connectedWeb3'
import { ERC20Service } from '../../../../../services'
import { getLogger } from '../../../../../util/logger'
import { formatBigNumber } from '../../../../../util/tools'
import { MarketDetailsTab, MarketMakerData, OutcomeTableValue, Status } from '../../../../../util/types'
import { Button, ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { FullLoading } from '../../../../loading'
import { ModalTransactionResult } from '../../../../modal/modal_transaction_result'
import { ButtonContainerFullWidth } from '../../../common/common_styled'
import MarketResolutionMessage from '../../../common/market_resolution_message'
import { MarketScale } from '../../../common/market_scale'
import { MarketTopDetailsClosed } from '../../../common/market_top_details_closed'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'
import { MarketBuyContainer } from '../../market_buy/market_buy_container'
import { MarketHistoryContainer } from '../../market_history/market_history_container'
import { MarketNavigation } from '../../market_navigation'
import { MarketPoolLiquidityContainer } from '../../market_pooling/market_pool_liquidity_container'
import { MarketSellContainer } from '../../market_sell/market_sell_container'

const TopCard = styled(ViewCard)`
  padding-bottom: 0;
  margin-bottom: 24px;
`

const BottomCard = styled(ViewCard)``

const MarketResolutionMessageStyled = styled(MarketResolutionMessage)`
  margin: 20px 0;
`

const StyledButtonContainer = styled(ButtonContainer)`
  margin: 0 -24px;
  margin-bottom: -1px;
  padding: 20px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.border {
    border-top: 1px solid ${props => props.theme.colors.verticalDivider};
  }
`

const SellBuyWrapper = styled.div`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 12px;
  }
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  isScalar: boolean
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const logger = getLogger('Market::ClosedMarketDetails')

const computeEarnedCollateral = (payouts: Maybe<Big[]>, balances: BigNumber[]): Maybe<BigNumber> => {
  if (!payouts) {
    return null
  }

  // use floor as rounding method
  Big.RM = 0

  const earnedCollateralPerOutcome = balances.map((balance, index) => new Big(balance.toString()).mul(payouts[index]))
  const earnedCollateral = earnedCollateralPerOutcome.reduce((a, b) => a.add(b.toFixed(0)), bigNumberify(0))

  return earnedCollateral
}

const scalarComputeEarnedCollateral = (finalAnswerPercentage: number, balances: BigNumber[]): Maybe<BigNumber> => {
  if (!balances[0] || (balances[0].isZero() && !balances[1]) || balances[1].isZero()) return null

  const numberBalances = balances.map(balance => Number(formatBigNumber(balance, 18, 18)))
  const shortEarnedCollateral = numberBalances[0] * (1 - finalAnswerPercentage)
  const longEarnedCollateral = numberBalances[1] * finalAnswerPercentage
  const earnedCollateral = parseUnits((shortEarnedCollateral + longEarnedCollateral).toString(), 18)

  return earnedCollateral
}

const Wrapper = (props: Props) => {
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const { account, library: provider } = context
  const { buildMarketMaker, conditionalTokens, oracle, realitio } = useContracts(context)

  const { fetchGraphMarketMakerData, isScalar, marketMakerData } = props

  const {
    address: marketMakerAddress,
    arbitrator,
    balances,
    collateral: collateralToken,
    isConditionResolved,
    payouts,
    question,
    realitioAnswer,
    scalarHigh,
    scalarLow,
  } = marketMakerData

  const history = useHistory()

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [collateral, setCollateral] = useState<BigNumber>(new BigNumber(0))

  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const resolveCondition = async () => {
    setModalTitle('Resolve Condition')

    try {
      setStatus(Status.Loading)
      setMessage('Resolving condition...')
      if (isScalar && scalarLow && scalarHigh) {
        await realitio.resolveCondition(question.id, question.raw, scalarLow, scalarHigh)
      } else {
        await oracle.resolveCondition(question, balances.length)
      }

      setStatus(Status.Ready)
      setMessage(`Condition successfully resolved.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to resolve the condition.`)
      logger.error(`${message} - ${err.message}`)
    }

    setIsModalTransactionResultOpen(true)
  }

  useEffect(() => {
    let isSubscribed = true

    const fetchBalance = async () => {
      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, account, collateralAddress)
      const collateralBalance = await collateralService.getCollateral(marketMakerAddress)
      if (isSubscribed) setCollateral(collateralBalance)
    }

    fetchBalance()

    return () => {
      isSubscribed = false
    }
  }, [provider, account, marketMakerAddress, marketMaker])

  const redeem = async () => {
    setModalTitle('Redeem Payout')

    try {
      if (!earnedCollateral) {
        return
      }

      if (!cpk) {
        return
      }

      setStatus(Status.Loading)
      setMessage('Redeeming payout...')

      await cpk.redeemPositions({
        isConditionResolved,
        earnedCollateral,
        question,
        numOutcomes: balances.length,
        oracle,
        collateralToken,
        marketMaker,
        conditionalTokens,
      })

      setStatus(Status.Ready)
      setMessage(`Payout successfully redeemed.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to redeem.`)
      logger.error(`${message} -  ${err.message}`)
    }

    setIsModalTransactionResultOpen(true)
  }

  const probabilities = balances.map(balance => balance.probability)

  const disabledColumns = [OutcomeTableValue.Outcome, OutcomeTableValue.Probability, OutcomeTableValue.Bonded]

  if (!account) {
    disabledColumns.push(OutcomeTableValue.Shares)
  }

  const buySellButtons = (
    <SellBuyWrapper>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={true}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.sell)
        }}
      >
        Sell
      </Button>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={true}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.buy)
        }}
      >
        Buy
      </Button>
    </SellBuyWrapper>
  )

  const [currentTab, setCurrentTab] = useState(MarketDetailsTab.swap)

  const switchMarketTab = (newTab: MarketDetailsTab) => {
    setCurrentTab(newTab)
  }

  const realitioAnswerNumber = Number(formatBigNumber(realitioAnswer || new BigNumber(0), 18))
  const scalarLowNumber = Number(formatBigNumber(scalarLow || new BigNumber(0), 18))
  const scalarHighNumber = Number(formatBigNumber(scalarHigh || new BigNumber(0), 18))

  const finalAnswerPercentage = (realitioAnswerNumber - scalarLowNumber) / (scalarHighNumber - scalarLowNumber)

  const earnedCollateral = isScalar
    ? scalarComputeEarnedCollateral(
        finalAnswerPercentage,
        balances.map(balance => balance.shares),
      )
    : computeEarnedCollateral(
        payouts,
        balances.map(balance => balance.shares),
      )

  const hasWinningOutcomes = earnedCollateral && earnedCollateral.gt(0)
  const winnersOutcomes = payouts ? payouts.filter(payout => payout.gt(0)).length : 0
  const userWinnersOutcomes = payouts
    ? payouts.filter(
        (payout, index) => balances[index] && balances[index].shares && balances[index].shares.gt(0) && payout.gt(0),
      ).length
    : 0
  const userWinnerShares = payouts
    ? balances.reduce((acc, balance, index) => (payouts[index].gt(0) ? acc.add(balance.shares) : acc), new BigNumber(0))
    : new BigNumber(0)
  const EPS = 0.01
  const allPayoutsEqual = payouts
    ? payouts.every(payout =>
        payout
          .sub(1 / payouts.length)
          .abs()
          .lte(EPS),
      )
    : false

  return (
    <>
      <TopCard>
        <MarketTopDetailsClosed collateral={collateral} marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={currentTab}
          hasWinningOutcomes={hasWinningOutcomes}
          marketMakerData={marketMakerData}
          switchMarketTab={switchMarketTab}
        ></MarketNavigation>
        {currentTab === MarketDetailsTab.swap && (
          <>
            {isScalar ? (
              <MarketScale
                border={true}
                currentPrediction={finalAnswerPercentage.toString()}
                lowerBound={scalarLow || new BigNumber(0)}
                startingPointTitle={'Final answer'}
                unit={question.title ? question.title.split('[')[1].split(']')[0] : ''}
                upperBound={scalarHigh || new BigNumber(0)}
              />
            ) : (
              <OutcomeTable
                balances={balances}
                collateral={collateralToken}
                disabledColumns={disabledColumns}
                displayRadioSelection={false}
                payouts={payouts}
                probabilities={probabilities}
                withWinningOutcome={true}
              />
            )}
            <WhenConnected>
              {hasWinningOutcomes && (
                <MarketResolutionMessageStyled
                  arbitrator={arbitrator}
                  collateralToken={collateralToken}
                  earnedCollateral={earnedCollateral}
                  invalid={allPayoutsEqual}
                  userWinnerShares={userWinnerShares}
                  userWinnersOutcomes={userWinnersOutcomes}
                  winnersOutcomes={winnersOutcomes}
                ></MarketResolutionMessageStyled>
              )}
              {isConditionResolved && !hasWinningOutcomes ? (
                <StyledButtonContainer>
                  <Button
                    buttonType={ButtonType.secondaryLine}
                    onClick={() => {
                      history.goBack()
                    }}
                  >
                    Back
                  </Button>
                  {buySellButtons}
                </StyledButtonContainer>
              ) : (
                <ButtonContainerFullWidth>
                  {!isConditionResolved && (
                    <>
                      <Button
                        buttonType={ButtonType.primary}
                        disabled={status === Status.Loading}
                        onClick={resolveCondition}
                      >
                        Resolve Condition
                      </Button>
                    </>
                  )}
                  {isConditionResolved && hasWinningOutcomes && (
                    <>
                      <Button
                        buttonType={ButtonType.primary}
                        disabled={status === Status.Loading}
                        onClick={() => redeem()}
                      >
                        Redeem
                      </Button>
                    </>
                  )}
                </ButtonContainerFullWidth>
              )}
            </WhenConnected>
          </>
        )}
        {currentTab === MarketDetailsTab.pool && (
          <MarketPoolLiquidityContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.history && <MarketHistoryContainer marketMakerData={marketMakerData} />}
        {currentTab === MarketDetailsTab.buy && (
          <MarketBuyContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.sell && (
          <MarketSellContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
      </BottomCard>
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

export const ClosedMarketDetails = withRouter(Wrapper)
