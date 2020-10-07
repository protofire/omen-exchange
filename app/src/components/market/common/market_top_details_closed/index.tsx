import { BigNumber } from 'ethers/utils'
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

  const [showingProgressBar, setShowingProgressBar] = useState(false)

  const useGraphMarketMakerDataResult = useGraphMarketMakerData(address, context.networkId)
  const creationTimestamp: string = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.creationTimestamp
    : ''
  const creationDate = new Date(1000 * parseInt(creationTimestamp))

  const finalizedTimestampDate = answerFinalizedTimestamp && new Date(answerFinalizedTimestamp.toNumber() * 1000)
  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  const toggleProgressBar = () => {
    setShowingProgressBar(!showingProgressBar)
  }

  return (
    <>
      <SubsectionTitleWrapper>
        <MarketTitle templateId={question.templateId} />
        <ProgressBarToggle
          active={showingProgressBar}
          state={'closed'}
          toggleProgressBar={toggleProgressBar}
        ></ProgressBarToggle>
      </SubsectionTitleWrapper>
      {showingProgressBar && (
        <ProgressBar
          answerFinalizedTimestamp={finalizedTimestampDate}
          arbitrationOccurred={arbitrationOccurred}
          creationTimestamp={creationDate}
          pendingArbitration={isPendingArbitration}
          resolutionTimestamp={question.resolution}
          state={'closed'}
        ></ProgressBar>
      )}
      <MarketData
        currency={collateralToken}
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

export { MarketTopDetailsClosed }
