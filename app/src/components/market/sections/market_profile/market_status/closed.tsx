import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useContracts } from '../../../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../../../services'
import { getLogger } from '../../../../../util/logger'
import { MarketMakerData, OutcomeTableValue, Status } from '../../../../../util/types'
import { ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { FullLoading } from '../../../../loading'
import { ModalTransactionResult } from '../../../../modal/modal_transaction_result'
import { ButtonContainerFullWidth, MarketBottomNavButton } from '../../../common/common_styled'
import MarketResolutionMessage from '../../../common/market_resolution_message'
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
  marketMakerData: MarketMakerData
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

const Wrapper = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const { buildMarketMaker, conditionalTokens, oracle } = useContracts(context)

  const { marketMakerData } = props

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
  const winnersOutcomes = payouts ? payouts.filter(payout => payout.gt(0)).length : 0
  const userWinnersOutcomes = payouts
    ? payouts.filter((payout, index) => balances[index].shares.gt(0) && payout.gt(0)).length
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

  const buySellButtons = (
    <SellBuyWrapper>
      <MarketBottomNavButton
        buttonType={ButtonType.secondaryLine}
        disabled={true}
        onClick={() => {
          setCurrentTab('SELL')
        }}
      >
        Sell
      </MarketBottomNavButton>
      <MarketBottomNavButton
        buttonType={ButtonType.secondaryLine}
        disabled={true}
        onClick={() => {
          setCurrentTab('BUY')
        }}
      >
        Buy
      </MarketBottomNavButton>
    </SellBuyWrapper>
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
    setCurrentTab(newTab)
  }

  return (
    <>
      <TopCard>
        <MarketTopDetailsClosed collateral={collateral} marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={currentTab}
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
                <StyledButtonContainer>
                  <MarketBottomNavButton
                    buttonType={ButtonType.secondaryLine}
                    onClick={() => {
                      history.goBack()
                    }}
                  >
                    Back
                  </MarketBottomNavButton>
                  {buySellButtons}
                </StyledButtonContainer>
              ) : (
                <ButtonContainerFullWidth borderTop={true}>
                  {!isConditionResolved && (
                    <>
                      <MarketBottomNavButton
                        buttonType={ButtonType.primary}
                        disabled={status === Status.Loading}
                        onClick={resolveCondition}
                      >
                        Resolve Condition
                      </MarketBottomNavButton>
                    </>
                  )}
                  {isConditionResolved && hasWinningOutcomes && (
                    <>
                      <MarketBottomNavButton
                        buttonType={ButtonType.primary}
                        disabled={status === Status.Loading}
                        onClick={() => redeem()}
                      >
                        Redeem
                      </MarketBottomNavButton>
                    </>
                  )}
                </ButtonContainerFullWidth>
              )}
            </WhenConnected>
          </>
        )}
        {currentTab === marketTabs.pool && (
          <MarketPoolLiquidityContainer marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
        )}
        {currentTab === marketTabs.history && <MarketHistoryContainer marketMakerData={marketMakerData} />}
        {currentTab === marketTabs.buy && (
          <MarketBuyContainer isScalar={false} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
        )}
        {currentTab === marketTabs.sell && (
          <MarketSellContainer isScalar={false} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
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
