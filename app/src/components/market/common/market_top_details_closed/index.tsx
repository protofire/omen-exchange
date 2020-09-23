import { BigNumber } from 'ethers'
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
    lastActiveDay,
    question,
    runningDailyVolumeByHour,
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
        answerFinalizedTimestamp={finalizedTimestampDate}
        arbitrationOccurred={arbitrationOccurred}
        creationTimestamp={creationDate}
        pendingArbitration={isPendingArbitration}
        resolutionTimestamp={question.resolution}
        state={'closed'}
      ></ProgressBar>
      <MarketData
        currency={collateralToken}
        lastActiveDay={lastActiveDay}
        resolutionTimestamp={question.resolution}
        runningDailyVolumeByHour={runningDailyVolumeByHour}
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

export { MarketTopDetailsClosed }
