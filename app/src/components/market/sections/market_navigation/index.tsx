import React from 'react'
import styled from 'styled-components'

import { MarketMakerData } from '../../../../util/types'

const MarketTabs = styled.div`
  display: flex;
  margin-bottom: 20px;
`

const MarketTab = styled.div<{ active: boolean }>`
  font-size: 14px;
  color: ${props => (props.active ? props.theme.buttonSecondary.color : props.theme.colors.clickable)};
  background: none;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  margin-right: 4px;
  background: ${props => (props.active ? props.theme.buttonSecondary.backgroundColor : `none`)};
  font-weight: ${props => (props.active ? `500` : `400`)};
  cursor: pointer;
`

interface Props {
  activeTab: string
  hasWinningOutcomes?: Maybe<boolean>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const MarketNavigation = (props: Props) => {
  const { activeTab, hasWinningOutcomes, marketMakerData, switchMarketTab } = props
  const { isQuestionFinalized, question } = marketMakerData
  const currentTimestamp = new Date().getTime()

  const isOpen = question.resolution.getTime() > currentTimestamp

  const marketTabs = {
    history: 'HISTORY',
    pool: 'POOL',
    swap: 'SWAP',
    verify: 'VERIFY',
    buy: 'BUY',
    sell: 'SELL',
  }

  const isFinalizing = question.resolution < new Date() && !isQuestionFinalized

  return (
    <MarketTabs>
      <MarketTab
        active={activeTab === marketTabs.swap || activeTab === marketTabs.buy || activeTab === marketTabs.sell}
        onClick={() => switchMarketTab('SWAP')}
      >
        {isQuestionFinalized && hasWinningOutcomes
          ? 'Redeem'
          : isQuestionFinalized && !hasWinningOutcomes
          ? 'Results'
          : isFinalizing
          ? 'Finalize'
          : 'Swap'}
      </MarketTab>
      <MarketTab active={activeTab === marketTabs.pool} onClick={() => switchMarketTab('POOL')}>
        Pool
      </MarketTab>
      <MarketTab active={activeTab === marketTabs.history} onClick={() => switchMarketTab('HISTORY')}>
        History
      </MarketTab>
      {/*here chaning display based upon market state*/}
      {isOpen && (
        <MarketTab active={activeTab === marketTabs.verify} onClick={() => switchMarketTab('VERIFY')}>
          Verify
        </MarketTab>
      )}
    </MarketTabs>
  )
}
