import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useContracts } from '../../../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../../../services'
import { getLogger } from '../../../../../util/logger'
import { MarketMakerData, OutcomeTableValue, Status } from '../../../../../util/types'
import { Button, ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { FullLoading } from '../../../../loading'
import { ModalTransactionResult } from '../../../../modal/modal_transaction_result'
import { ButtonContainerFullWidth } from '../../../common/common_styled'
import MarketResolutionMessage from '../../../common/market_resolution_message'
import { MarketTopDetailsClosed } from '../../../common/market_top_details_closed'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'
import { MarketNavigation } from '../../market_navigation'

const TopCard = styled(ViewCard)`
  padding-bottom: 0;
  margin-bottom: 24px;
`

const BottomCard = styled(ViewCard)``

const MarketResolutionMessageStyled = styled(MarketResolutionMessage)`
  margin: 20px 0;
`

const LeftButton = styled(Button)`
  margin-right: auto;
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  marketMakerData: MarketMakerData
}

const logger = getLogger('Market::ClosedMarketDetail')

const computeEarnedCollateral = (payouts: Maybe<number[]>, balances: BigNumber[]): Maybe<BigNumber> => {
  if (!payouts) {
    return null
  }

  // use floor as rounding method
  Big.RM = 0

  const earnedCollateralPerOutcome = balances.map((balance, index) => new Big(balance.toString()).mul(payouts[index]))

  const earnedCollateral = earnedCollateralPerOutcome.reduce((a, b) => a.add(b))

  return bigNumberify(earnedCollateral.toFixed(0))
}

const Wrapper = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const { buildMarketMaker, conditionalTokens, oracle } = useContracts(context)

  const { history, marketMakerData } = props

  const {
    address: marketMakerAddress,
    arbitrator,
    balances,
    collateral: collateralToken,
    isConditionResolved,
    isQuestionFinalized,
    payouts,
    question,
  } = marketMakerData

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
      await oracle.resolveCondition(question, balances.length)

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

  const earnedCollateral = computeEarnedCollateral(
    payouts,
    balances.map(balance => balance.shares),
  )

  const redeem = async () => {
    setModalTitle('Redeem Payout')

    try {
      if (!earnedCollateral) {
        return
      }

      setStatus(Status.Loading)
      setMessage('Redeeming payout...')

      const cpk = await CPKService.create(provider)

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

  const disabledColumns = [OutcomeTableValue.Outcome, OutcomeTableValue.Probability]

  if (!account) {
    disabledColumns.push(OutcomeTableValue.Shares)
  }

  const hasWinningOutcomes = earnedCollateral && earnedCollateral.gt(0)
  const winnersOutcomes = payouts ? payouts.filter(payout => payout > 0).length : 0
  const userWinnersOutcomes = payouts
    ? payouts.filter((payout, index) => balances[index].shares.gt(0) && payout > 0).length
    : 0
  const userWinnerShares = payouts
    ? balances.reduce((acc, balance, index) => (payouts[index] > 0 ? acc.add(balance.shares) : acc), new BigNumber(0))
    : new BigNumber(0)
  const EPS = 0.01
  const allPayoutsEqual = payouts ? payouts.every(payout => Math.abs(payout - 1 / payouts.length) <= EPS) : false

  const poolButton = (
    <LeftButton
      buttonType={ButtonType.secondaryLine}
      onClick={() => {
        history.push(`${marketMakerAddress}/pool-liquidity`)
      }}
    >
      Pool Liquidity
    </LeftButton>
  )

  const buySellButtons = (
    <>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={true}
        onClick={() => {
          history.push(`${marketMakerAddress}/sell`)
        }}
      >
        Sell
      </Button>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={true}
        onClick={() => {
          history.push(`${marketMakerAddress}/buy`)
        }}
      >
        Buy
      </Button>
    </>
  )

  const [currentTab, setCurrentTab] = useState('SWAP')

  const marketTabs = {
    swap: 'SWAP',
    pool: 'POOL',
    history: 'HISTORY',
    verify: 'VERIFY',
    buy: 'BUY',
    sell: 'SELL',
  }

  const switchMarketTab = (newTab: string) => {
    if (newTab in marketTabs) {
      setCurrentTab(newTab)
    }
  }

  return (
    <>
      <TopCard>
        <MarketTopDetailsClosed collateral={collateral} marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={'SWAP'}
          hasWinningOutcomes={hasWinningOutcomes}
          isQuestionFinalized={isQuestionFinalized}
          marketAddress={marketMakerAddress}
          resolutionDate={question.resolution}
          switchMarketTab={switchMarketTab}
        ></MarketNavigation>
        {currentTab === marketTabs.swap && (
          <>
            <OutcomeTable
              balances={balances}
              collateral={collateralToken}
              disabledColumns={disabledColumns}
              displayRadioSelection={false}
              payouts={payouts}
              probabilities={probabilities}
              withWinningOutcome={true}
            />
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
                <ButtonContainer>
                  {poolButton}
                  {buySellButtons}
                </ButtonContainer>
              ) : (
                <ButtonContainerFullWidth borderTop={true}>
                  {!isConditionResolved && (
                    <>
                      {poolButton}
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
                      {poolButton}
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
        {currentTab === marketTabs.pool && <p>pool</p>}
        {currentTab === marketTabs.history && <p>history</p>}
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

export const ClosedMarketDetail = withRouter(Wrapper)
