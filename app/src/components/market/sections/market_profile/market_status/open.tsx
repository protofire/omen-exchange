import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedCPKContext, useGraphMarketTradeData } from '../../../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../../../hooks/connectedWeb3'
import { useRealityLink } from '../../../../../hooks/useRealityLink'
import { isDust } from '../../../../../util/tools'
import { BalanceItem, MarketDetailsTab, MarketMakerData, OutcomeTableValue } from '../../../../../util/types'
import { Button, ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { MarketScale } from '../../../common/market_scale'
import { MarketTopDetailsOpen } from '../../../common/market_top_details_open'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'
import { WarningMessage } from '../../../common/warning_message'
import { MarketBondContainer } from '../../market_bond/market_bond_container'
import { MarketBuyContainer } from '../../market_buy/market_buy_container'
import { MarketHistoryContainer } from '../../market_history/market_history_container'
import { MarketNavigation } from '../../market_navigation'
import { MarketPoolLiquidityContainer } from '../../market_pooling/market_pool_liquidity_container'
import { MarketSellContainer } from '../../market_sell/market_sell_container'
import { MarketVerifyContainer } from '../../market_verify/market_verify_container'

export const TopCard = styled(ViewCard)`
  padding: 24px;
  padding-bottom: 0;
  margin-bottom: 24px;
`

export const BottomCard = styled(ViewCard)``

const MessageWrapper = styled.div`
  border-radius: 4px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px 25px;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  line-height: 1.2;
  margin: 0 0 8px;
`

const Text = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 0.2px;
  line-height: 1.5;
  margin: 0;
`

export const StyledButtonContainer = styled(ButtonContainer)`
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

const MarketBottomNavGroupWrapper = styled.div`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 12px;
  }
`

const MarketBottomFinalizeNavGroupWrapper = styled.div`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 12px;
  }
`

const WarningMessageStyled = styled(WarningMessage)`
  margin-top: 20px;
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  account: Maybe<string>
  isScalar: boolean
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const Wrapper = (props: Props) => {
  const { fetchGraphMarketMakerData, isScalar, marketMakerData } = props
  const realitioBaseUrl = useRealityLink()
  const history = useHistory()
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const {
    balances,
    collateral,
    fee,
    isQuestionFinalized,
    outcomeTokenMarginalPrices,
    payouts,
    question,
    scalarHigh,
    scalarLow,
    totalPoolShares,
  } = marketMakerData

  const isQuestionOpen = question.resolution.valueOf() < Date.now()

  useEffect(() => {
    const timeDifference = new Date(question.resolution).getTime() - new Date().getTime()
    const maxTimeDifference = 86400000
    if (timeDifference > 0 && timeDifference < maxTimeDifference) {
      setTimeout(callAfterTimeout, timeDifference + 2000)
    }
    function callAfterTimeout() {
      fetchGraphMarketMakerData()
      setCurrentTab(MarketDetailsTab.finalize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return shares && !isDust(shares, collateral.decimals)
  })

  const probabilities = balances.map(balance => balance.probability)
  const hasFunding = totalPoolShares.gt(0)

  const renderTableData = () => {
    const disabledColumns = [
      OutcomeTableValue.Payout,
      OutcomeTableValue.Outcome,
      OutcomeTableValue.Probability,
      OutcomeTableValue.Bonded,
    ]

    if (!userHasShares) {
      disabledColumns.push(OutcomeTableValue.Shares)
    }

    return (
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
        probabilities={probabilities}
      />
    )
  }

  const renderFinalizeTableData = () => {
    const disabledColumns = [
      OutcomeTableValue.OutcomeProbability,
      OutcomeTableValue.Probability,
      OutcomeTableValue.CurrentPrice,
      OutcomeTableValue.Payout,
    ]

    return (
      <OutcomeTable
        balances={balances}
        bonds={question.bonds}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
        isBond
        payouts={payouts}
        probabilities={probabilities}
        withWinningOutcome
      />
    )
  }

  const openQuestionMessage = (
    <MessageWrapper>
      <Title>The question is being resolved.</Title>
      <Text>You will be able to redeem your winnings as soon as the market is resolved.</Text>
    </MessageWrapper>
  )

  const openInRealitioButton = (
    <Button
      buttonType={ButtonType.secondaryLine}
      onClick={() => {
        window.open(`${realitioBaseUrl}/app/#!/question/${question.id}`)
      }}
    >
      Answer on Reality.eth
    </Button>
  )

  const finalizeButtons = (
    <MarketBottomFinalizeNavGroupWrapper>
      <Button
        buttonType={ButtonType.secondaryLine}
        onClick={() => {
          window.open(`${realitioBaseUrl}/app/#!/question/${question.id}`)
        }}
      >
        Call Arbitrator
      </Button>
      <Button
        buttonType={ButtonType.primary}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.setOutcome)
        }}
      >
        Set Outcome
      </Button>
    </MarketBottomFinalizeNavGroupWrapper>
  )

  const buySellButtons = (
    <MarketBottomNavGroupWrapper>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!userHasShares || !hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.sell)
        }}
      >
        Sell
      </Button>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.buy)
        }}
      >
        Buy
      </Button>
    </MarketBottomNavGroupWrapper>
  )

  const isFinalizing = question.resolution < new Date() && !isQuestionFinalized

  const [currentTab, setCurrentTab] = useState(
    isQuestionFinalized || !isFinalizing ? MarketDetailsTab.swap : MarketDetailsTab.finalize,
  )

  const switchMarketTab = (newTab: MarketDetailsTab) => {
    setCurrentTab(newTab)
  }

  const { fetchData: fetchGraphMarketTradeData, status, trades } = useGraphMarketTradeData(
    question.title,
    collateral.address,
    cpk?.address.toLowerCase(),
  )

  useEffect(() => {
    if ((isQuestionFinalized || !isFinalizing) && currentTab === MarketDetailsTab.finalize) {
      setCurrentTab(MarketDetailsTab.swap)
    }
    // eslint-disable-next-line
  }, [isQuestionFinalized, isFinalizing])

  return (
    <>
      <TopCard>
        <MarketTopDetailsOpen marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={currentTab}
          marketMakerData={marketMakerData}
          switchMarketTab={switchMarketTab}
        ></MarketNavigation>
        {currentTab === MarketDetailsTab.swap && (
          <>
            {isScalar ? (
              <>
                <MarketScale
                  balances={balances}
                  borderBottom={false}
                  borderTop={true}
                  collateral={collateral}
                  currentPrediction={outcomeTokenMarginalPrices[1]}
                  fee={fee}
                  lowerBound={scalarLow || new BigNumber(0)}
                  positionTable={true}
                  startingPointTitle={'Current prediction'}
                  status={status}
                  trades={trades}
                  unit={question.title ? question.title.split('[')[1].split(']')[0] : ''}
                  upperBound={scalarHigh || new BigNumber(0)}
                />
              </>
            ) : (
              renderTableData()
            )}
            {!hasFunding && !isQuestionOpen && (
              <WarningMessageStyled
                additionalDescription={''}
                description={'Trading is disabled due to lack of liquidity.'}
                grayscale={true}
                href={''}
                hyperlinkDescription={''}
              />
            )}
            <WhenConnected>
              <StyledButtonContainer className={!hasFunding || isQuestionOpen ? 'border' : ''}>
                <Button
                  buttonType={ButtonType.secondaryLine}
                  onClick={() => {
                    history.goBack()
                  }}
                >
                  Back
                </Button>
                {isQuestionOpen ? openInRealitioButton : buySellButtons}
              </StyledButtonContainer>
            </WhenConnected>
          </>
        )}
        {currentTab === MarketDetailsTab.finalize ? (
          !isScalar ? (
            <>
              {renderFinalizeTableData()}
              <WhenConnected>
                <StyledButtonContainer className={!hasFunding ? 'border' : ''}>
                  <Button
                    buttonType={ButtonType.secondaryLine}
                    onClick={() => {
                      history.goBack()
                    }}
                  >
                    Back
                  </Button>
                  {finalizeButtons}
                </StyledButtonContainer>
              </WhenConnected>
            </>
          ) : (
            <>
              <MarketScale
                borderTop={true}
                currentPrediction={outcomeTokenMarginalPrices ? outcomeTokenMarginalPrices[1] : null}
                lowerBound={scalarLow || new BigNumber(0)}
                startingPointTitle={'Current prediction'}
                unit={question.title ? question.title.split('[')[1].split(']')[0] : ''}
                upperBound={scalarHigh || new BigNumber(0)}
              />
              {openQuestionMessage}
              <WhenConnected>
                <StyledButtonContainer className={!hasFunding || isQuestionOpen ? 'border' : ''}>
                  <Button
                    buttonType={ButtonType.secondaryLine}
                    onClick={() => {
                      history.goBack()
                    }}
                  >
                    Back
                  </Button>
                  {isQuestionOpen ? openInRealitioButton : buySellButtons}
                </StyledButtonContainer>
              </WhenConnected>
            </>
          )
        ) : null}
        {currentTab === MarketDetailsTab.setOutcome && (
          <MarketBondContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.pool && (
          <MarketPoolLiquidityContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            fetchGraphMarketTradeData={fetchGraphMarketTradeData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.history && <MarketHistoryContainer marketMakerData={marketMakerData} />}
        {currentTab === MarketDetailsTab.buy && (
          <MarketBuyContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            fetchGraphMarketTradeData={fetchGraphMarketTradeData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.sell && (
          <MarketSellContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            fetchGraphMarketTradeData={fetchGraphMarketTradeData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.verify && (
          <MarketVerifyContainer
            context={context}
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
      </BottomCard>
    </>
  )
}

export const OpenMarketDetails = withRouter(Wrapper)
