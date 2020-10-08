import React, { useState } from 'react'

import { useConnectedWeb3Context, useGraphMarketMakerData } from '../../../../hooks'
import { MarketMakerData } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { AdditionalMarketData } from '../additional_market_data'
import { MarketData } from '../market_data'
import { MarketTitle } from '../market_title'
import { ProgressBar } from '../progress_bar'
import { ProgressBarToggle } from '../progress_bar/toggle'

interface Props {
  marketMakerData: MarketMakerData
  title?: string
}

const MarketTopDetailsOpen: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const [showingProgressBar, setShowingProgressBar] = useState(false)

  const { marketMakerData, title } = props
  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateral,
    lastActiveDay,
    question,
    runningDailyVolumeByHour,
  } = marketMakerData

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
      : question.resolution.getTime() < currentTimestamp &&
        (answerFinalizedTimestamp === null || answerFinalizedTimestamp.toNumber() * 1000 > currentTimestamp)
      ? 'finalizing'
      : isPendingArbitration
      ? 'arbitration'
      : answerFinalizedTimestamp && answerFinalizedTimestamp.toNumber() * 1000 < currentTimestamp
      ? 'closed'
      : ''

  const toggleProgressBar = () => {
    setShowingProgressBar(!showingProgressBar)
  }

  return (
    <>
      <SubsectionTitleWrapper>
        <MarketTitle templateId={question.templateId} title={title} />
        <ProgressBarToggle
          active={showingProgressBar}
          state={marketState}
          toggleProgressBar={toggleProgressBar}
        ></ProgressBarToggle>
      </SubsectionTitleWrapper>
      {showingProgressBar && (
        <ProgressBar
          answerFinalizedTimestamp={finalizedTimestampDate}
          arbitrationOccurred={arbitrationOccurred}
          bondTimestamp={question.currentAnswerTimestamp}
          creationTimestamp={creationDate}
          pendingArbitration={isPendingArbitration}
          resolutionTimestamp={question.resolution}
          state={marketState}
        ></ProgressBar>
      )}
      <MarketData
        currency={collateral}
        lastActiveDay={lastActiveDay}
        resolutionTimestamp={question.resolution}
        runningDailyVolumeByHour={runningDailyVolumeByHour}
      ></MarketData>
      <AdditionalMarketData
        arbitrator={arbitrator}
        category={question.category}
        id={question.id}
        oracle="Reality.eth"
      ></AdditionalMarketData>
    </>
  )
}

export { MarketTopDetailsOpen }
