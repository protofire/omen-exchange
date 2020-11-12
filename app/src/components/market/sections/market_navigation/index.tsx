import React from 'react'
import styled from 'styled-components'

import { MarketDetailsTab } from '../../../../util/types'

const MarketTabs = styled.div`
  display: flex;
  margin-bottom: 20px;
`

const MarketTab = styled.div<{ active: boolean }>`
  font-size: ${({ theme }) => theme.fonts.defaultSize};
  color: ${props => (props.active ? props.theme.buttonSecondary.color : props.theme.colors.clickable)};
  background: none;
  border: none;
  border-radius: 32px;
  padding: 10px 18px;
  margin-right: 4px;
  background: ${props => (props.active ? props.theme.buttonSecondary.backgroundColor : `none`)};
  font-weight: ${props => (props.active ? `500` : `400`)};
  cursor: pointer;
`

const MarketSetOutcomeTab = styled.div`
  font-size: ${({ theme }) => theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorDark};
  background: none;
  border: none;
  border-radius: 32px;
  padding: 10px 18px;
  margin-right: 4px;
`

interface Props {
  activeTab: string
  marketAddress: string
  hasWinningOutcomes?: Maybe<boolean>
  isQuestionFinalized: boolean
  resolutionDate: Date
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

export const MarketNavigation = (props: Props) => {
  const { activeTab, hasWinningOutcomes, isQuestionFinalized, resolutionDate, switchMarketTab } = props

  const isFinalizing = resolutionDate < new Date() && !isQuestionFinalized

  if (activeTab === MarketDetailsTab.setOutcome) {
    return (
      <MarketTabs>
        <MarketSetOutcomeTab>Set Outcome</MarketSetOutcomeTab>
      </MarketTabs>
    )
  }

  return (
    <MarketTabs>
      {(isQuestionFinalized || !isFinalizing) && (
        <MarketTab
          active={
            activeTab === MarketDetailsTab.swap ||
            activeTab === MarketDetailsTab.buy ||
            activeTab === MarketDetailsTab.sell
          }
          onClick={() => switchMarketTab(MarketDetailsTab.swap)}
        >
          {isQuestionFinalized && hasWinningOutcomes
            ? 'Redeem'
            : isQuestionFinalized && !hasWinningOutcomes
            ? 'Results'
            : 'Swap'}
        </MarketTab>
      )}
      {isFinalizing && (
        <MarketTab
          active={activeTab === MarketDetailsTab.finalize}
          onClick={() => switchMarketTab(MarketDetailsTab.finalize)}
        >
          Finalize
        </MarketTab>
      )}
      <MarketTab active={activeTab === MarketDetailsTab.pool} onClick={() => switchMarketTab(MarketDetailsTab.pool)}>
        Pool
      </MarketTab>
      <MarketTab
        active={activeTab === MarketDetailsTab.history}
        onClick={() => switchMarketTab(MarketDetailsTab.history)}
      >
        History
      </MarketTab>
    </MarketTabs>
  )
}
