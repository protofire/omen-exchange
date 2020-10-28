import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../../util/types'
import { MarketScale } from '../../../common/market_scale'
import { MarketTopDetailsOpen } from '../../../common/market_top_details_open'
import { MarketNavigation } from '../../market_navigation'

import { BottomCard, TopCard } from './open'

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const Wrapper = (props: Props) => {
  const { marketMakerData } = props

  const { address: marketMakerAddress, isQuestionFinalized, question } = marketMakerData

  // TODO: Remove hardcoded values
  const lowerBound = new BigNumber('0')
  const currentPrediction = new BigNumber('720')
  const upperBound = new BigNumber('1000')
  const unit = 'USD'

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
        <MarketScale
          // TODO: Change to collateral.decimals
          decimals={0}
          lowerBound={lowerBound}
          startingPoint={currentPrediction}
          startingPointTitle={'Current prediction'}
          unit={unit}
          upperBound={upperBound}
        />
      </BottomCard>
    </>
  )
}

export const OpenScalarMarketDetails = withRouter(Wrapper)
