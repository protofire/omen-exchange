import React, { useState } from 'react'

import { useConnectedWeb3Context, useGraphMarketMakerData } from '../../../../hooks'
import { MarketMakerData } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { AdditionalMarketData } from '../additional_market_data'
import { HistoryChartContainer } from '../history_chart'
import { MarketData } from '../market_data'
import { MarketTitle } from '../market_title'
import { ProgressBar } from '../progress_bar'

interface Props {
  marketMakerData: MarketMakerData
  title?: string
}

const MarketTopDetailsOpen: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const [showingTradeHistory, setShowingTradeHistory] = useState(false)
  const [tradeHistoryLoaded, setTradeHistoryLoaded] = useState(false)

  const { marketMakerData, title } = props
  const { address, answerFinalizedTimestamp, arbitrator, collateral, collateralVolume, question } = marketMakerData

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

  const currentTimestamp = new Date().getTime()

  const finalizedTimestampDate = answerFinalizedTimestamp && new Date(answerFinalizedTimestamp.toNumber() * 1000)
  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  const marketState =
    question.resolution.getTime() > currentTimestamp
      ? 'open'
      : question.resolution.getTime() < currentTimestamp && answerFinalizedTimestamp === null
      ? 'finalizing'
      : isPendingArbitration
      ? 'arbitration'
      : answerFinalizedTimestamp && answerFinalizedTimestamp.toNumber() < currentTimestamp
      ? 'closed'
      : ''

  return (
    <>
      <SubsectionTitleWrapper>
        <MarketTitle templateId={question.templateId} title={title} />
      </SubsectionTitleWrapper>
      <ProgressBar
        answerFinalizedTimestamp={finalizedTimestampDate}
        arbitrationOccurred={arbitrationOccurred}
        creationTimestamp={creationDate}
        pendingArbitration={isPendingArbitration}
        resolutionTimestamp={question.resolution}
        state={marketState}
      ></ProgressBar>
      <MarketData
        currency={collateral}
        dailyVolume={collateralVolume}
        resolutionTimestamp={question.resolution}
      ></MarketData>
      <AdditionalMarketData
        arbitrator={arbitrator}
        category={question.category}
        handleTradeHistoryClick={toggleTradeHistory}
        id={question.id}
        oracle="Reality.eth"
        showingTradeHistory={showingTradeHistory}
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

export { MarketTopDetailsOpen }
