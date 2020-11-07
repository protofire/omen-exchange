import React, { useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { WhenConnected } from '../../../../../hooks/connectedWeb3'
import { useRealityLink } from '../../../../../hooks/useRealityLink'
import { BalanceItem, MarketDetailsTab, MarketMakerData, OutcomeTableValue } from '../../../../../util/types'
import { ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { MarketBottomNavButton } from '../../../common/common_styled'
import { MarketTopDetailsOpen } from '../../../common/market_top_details_open'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'
import { WarningMessage } from '../../../common/warning_message'
import { MarketBuyContainer } from '../../market_buy/market_buy_container'
import { MarketHistoryContainer } from '../../market_history/market_history_container'
import { MarketNavigation } from '../../market_navigation'
import { MarketPoolLiquidityContainer } from '../../market_pooling/market_pool_liquidity_container'
import { MarketSellContainer } from '../../market_sell/market_sell_container'

const TopCard = styled(ViewCard)`
  padding: 24px;
  padding-bottom: 0;
  margin-bottom: 24px;
`

const BottomCard = styled(ViewCard)``

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
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const Wrapper = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData } = props
  const realitioBaseUrl = useRealityLink()
  const history = useHistory()

  const {
    address: marketMakerAddress,
    balances,
    collateral,
    isQuestionFinalized,
    payouts,
    question,
    totalPoolShares,
  } = marketMakerData

  const isQuestionOpen = question.resolution.valueOf() < Date.now()

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const probabilities = balances.map(balance => balance.probability)
  const hasFunding = totalPoolShares.gt(0)

  const renderTableData = () => {
    const disabledColumns = [OutcomeTableValue.Payout, OutcomeTableValue.Outcome, OutcomeTableValue.Probability]

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
    ]

    return (
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
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
    <MarketBottomNavButton
      buttonType={ButtonType.secondaryLine}
      onClick={() => {
        window.open(`${realitioBaseUrl}/app/#!/question/${question.id}`)
      }}
    >
      Answer on Reality.eth
    </MarketBottomNavButton>
  )

  const finalizeButtons = (
    <MarketBottomFinalizeNavGroupWrapper>
      <MarketBottomNavButton
        buttonType={ButtonType.secondaryLine}
        onClick={() => {
          window.open(`${realitioBaseUrl}/app/#!/question/${question.id}`)
        }}
      >
        Call Arbitrator
      </MarketBottomNavButton>
      <MarketBottomNavButton
        buttonType={ButtonType.primary}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.setOutcome)
        }}
      >
        Set Outcome
      </MarketBottomNavButton>
    </MarketBottomFinalizeNavGroupWrapper>
  )

  const buySellButtons = (
    <MarketBottomNavGroupWrapper>
      <MarketBottomNavButton
        buttonType={ButtonType.secondaryLine}
        disabled={!userHasShares || !hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.sell)
        }}
      >
        Sell
      </MarketBottomNavButton>
      <MarketBottomNavButton
        buttonType={ButtonType.secondaryLine}
        disabled={!hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.buy)
        }}
      >
        Buy
      </MarketBottomNavButton>
    </MarketBottomNavGroupWrapper>
  )

  const isFinalizing = question.resolution < new Date() && !isQuestionFinalized

  const [currentTab, setCurrentTab] = useState(
    isQuestionFinalized || !isFinalizing ? MarketDetailsTab.swap : MarketDetailsTab.finalize,
  )

  const switchMarketTab = (newTab: MarketDetailsTab) => {
    setCurrentTab(newTab)
  }

  return (
    <>
      <TopCard>
        <MarketTopDetailsOpen marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={currentTab}
          isQuestionFinalized={isQuestionFinalized}
          marketAddress={marketMakerAddress}
          resolutionDate={question.resolution}
          switchMarketTab={switchMarketTab}
        ></MarketNavigation>
        {currentTab === MarketDetailsTab.swap && (
          <>
            {renderTableData()}
            {isQuestionOpen && openQuestionMessage}
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
              <StyledButtonContainer className={!hasFunding ? 'border' : ''}>
                <MarketBottomNavButton
                  buttonType={ButtonType.secondaryLine}
                  onClick={() => {
                    history.goBack()
                  }}
                >
                  Back
                </MarketBottomNavButton>
                {isQuestionOpen ? openInRealitioButton : buySellButtons}
              </StyledButtonContainer>
            </WhenConnected>
          </>
        )}
        {currentTab === MarketDetailsTab.finalize && (
          <>
            {renderFinalizeTableData()}
            <WhenConnected>
              <StyledButtonContainer className={!hasFunding ? 'border' : ''}>
                <MarketBottomNavButton
                  buttonType={ButtonType.secondaryLine}
                  onClick={() => {
                    history.goBack()
                  }}
                >
                  Back
                </MarketBottomNavButton>
                {finalizeButtons}
              </StyledButtonContainer>
            </WhenConnected>
          </>
        )}
        {currentTab === MarketDetailsTab.pool && (
          <MarketPoolLiquidityContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.history && <MarketHistoryContainer marketMakerData={marketMakerData} />}
        {currentTab === MarketDetailsTab.buy && (
          <MarketBuyContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.sell && (
          <MarketSellContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {/* {currentTab === MarketDetailsTab.verify && <p>verify</p>} */}
      </BottomCard>
    </>
  )
}

export const OpenMarketDetails = withRouter(Wrapper)
