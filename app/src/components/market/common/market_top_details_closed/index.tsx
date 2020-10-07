import { BigNumber } from 'ethers/utils'
import React from 'react'

import { useConnectedWeb3Context, useGraphMarketMakerData } from '../../../../hooks'
import { MarketMakerData } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { AdditionalMarketData } from '../additional_market_data'
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

  const useGraphMarketMakerDataResult = useGraphMarketMakerData(address, context.networkId)
  const creationTimestamp: string = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.creationTimestamp
    : ''
  const creationDate = new Date(1000 * parseInt(creationTimestamp))

  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  return (
    <>
      <SubsectionTitleWrapper>
        <MarketTitle templateId={question.templateId} />
      </SubsectionTitleWrapper>
      <ProgressBar
        answerFinalizedTimestamp={answerFinalizedTimestamp}
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
        id={question.id}
        oracle="Reality.eth"
      ></AdditionalMarketData>
    </>
  )
}

export { MarketTopDetailsClosed }
