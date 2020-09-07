import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'

import { useGraphMarketMakerData, useConnectedWeb3Context } from '../../../../hooks'
import { MarketMakerData } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { HistoryChartContainer } from '../history_chart'
import { MarketTitle } from '../market_title'
import { ProgressBar } from '../progress_bar'
import { MarketData } from '../market_data'
import { AdditionalMarketData } from '../additional_market_data'

interface Props {
  marketMakerData: MarketMakerData
  collateral: BigNumber
}

const MarketTopDetailsClosed: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { marketMakerData } = props

  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateral: collateralToken,
    collateralVolume,
    question,
  } = marketMakerData

  const [showingTradeHistory, setShowingTradeHistory] = useState(false)
  const [tradeHistoryLoaded, setTradeHistoryLoaded] = useState(false)

  const toggleTradeHistory = () => {
    if (showingTradeHistory) {
      setShowingTradeHistory(false)
    } else {
      setShowingTradeHistory(true)
      // After first load on demand we maintain this value to only load the data when history is shown.
      setTradeHistoryLoaded(true)
    }
  }

  const useGraphMarketMakerDataResult = useGraphMarketMakerData(address, context.networkId)
  const creationTimestamp: string = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.creationTimestamp
    : ''
  const creationDate = new Date(1000 * parseInt(creationTimestamp))
  
  const finalizedTimestampDate = answerFinalizedTimestamp && new Date(answerFinalizedTimestamp.toNumber() * 1000)
  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  return (
    <>
      <SubsectionTitleWrapper>
        <MarketTitle templateId={question.templateId} />
      </SubsectionTitleWrapper>
      <ProgressBar 
        state={'closed'} 
        creationTimestamp={creationDate} 
        resolutionTimestamp={question.resolution} 
        pendingArbitration={isPendingArbitration} 
        arbitrationOccurred={arbitrationOccurred}
        answerFinalizedTimestamp={finalizedTimestampDate}
      ></ProgressBar>
      <MarketData resolutionTimestamp={question.resolution} dailyVolume={collateralVolume} currency={collateralToken}></MarketData>
      <AdditionalMarketData 
        category={question.category} 
        arbitrator={arbitrator} 
        oracle='Reality.eth' 
        id={question.id}
        showingTradeHistory={showingTradeHistory}
        handleTradeHistoryClick={toggleTradeHistory}
      ></AdditionalMarketData>
      {tradeHistoryLoaded && (
        <HistoryChartContainer
          answerFinalizedTimestamp={answerFinalizedTimestamp}
          hidden={!showingTradeHistory}
          marketMakerAddress={address}
          outcomes={question.outcomes}
        />
      )}
    </>
  )
}

export { MarketTopDetailsClosed }
