import React, { useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import { IMPORT_QUESTION_ID_KEY } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks'
import { useGraphMarketsFromQuestion } from '../../../../hooks/useGraphMarketsFromQuestion'
import { MarketMakerData, MarketState, Token } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { MoreMenu } from '../../../common/form/more_menu'
import { AdditionalMarketData } from '../additional_market_data'
import { CurrencySelector } from '../currency_selector'
import { MarketData } from '../market_data'
import { ProgressBar } from '../progress_bar'
import { ProgressBarToggle } from '../progress_bar/toggle'

const SubsectionTitleLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  & > * + * {
    margin-left: 12px;
  }
`

const MarketCurrencySelector = styled(CurrencySelector)`
  .dropdownItems {
    min-width: auto;
  }
`

interface Props {
  marketMakerData: MarketMakerData
  title?: string
}

const MarketTopDetailsOpen: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const [showingProgressBar, setShowingProgressBar] = useState(false)
  const history = useHistory()

  const { marketMakerData } = props
  const {
    answerFinalizedTimestamp,
    arbitrator,
    collateral,
    collateralVolume,
    creationTimestamp,
    curatedByDxDaoOrKleros: isVerified,
    lastActiveDay,
    question,
    runningDailyVolumeByHour,
    scaledLiquidityParameter,
  } = marketMakerData

  const creationDate = new Date(1000 * parseInt(creationTimestamp))

  const currentTimestamp = new Date().getTime()

  const formattedLiquidity: string = scaledLiquidityParameter ? scaledLiquidityParameter.toFixed(2) : '0'

  // const finalizedTimestampDate = answerFinalizedTimestamp && new Date(answerFinalizedTimestamp.toNumber() * 1000)
  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  const marketState =
    question.resolution.getTime() > currentTimestamp
      ? MarketState.open
      : question.resolution.getTime() < currentTimestamp &&
        (answerFinalizedTimestamp === null || answerFinalizedTimestamp.toNumber() * 1000 > currentTimestamp)
      ? MarketState.finalizing
      : isPendingArbitration
      ? MarketState.arbitration
      : answerFinalizedTimestamp && answerFinalizedTimestamp.toNumber() * 1000 < currentTimestamp
      ? MarketState.closed
      : MarketState.none

  const { markets: marketsRelatedQuestion } = useGraphMarketsFromQuestion(question.id)

  const toggleProgressBar = () => {
    setShowingProgressBar(!showingProgressBar)
  }

  const moreMenuItems = [
    {
      onClick: () => {
        localStorage.setItem(IMPORT_QUESTION_ID_KEY, question.id)
        history.push('/create')
      },
      content: 'Add Currency',
    },
  ]

  const onChangeMarketCurrency = (currency: Token | null) => {
    if (currency) {
      const selectedMarket = marketsRelatedQuestion.find(e => e.collateralToken === currency.address.toLowerCase())
      if (selectedMarket && selectedMarket.collateralToken !== collateral.address) {
        history.replace(`/${selectedMarket.id}`)
      }
    }
  }

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitleLeftWrapper>
          {marketsRelatedQuestion.length > 1 && (
            <MarketCurrencySelector
              context={context}
              currency={collateral.address}
              disabled={false}
              filters={marketsRelatedQuestion.map(element => element.collateralToken)}
              onSelect={onChangeMarketCurrency}
              placeholder=""
            />
          )}
          <ProgressBarToggle
            active={showingProgressBar}
            state={marketState}
            templateId={question.templateId}
            toggleProgressBar={toggleProgressBar}
          ></ProgressBarToggle>
        </SubsectionTitleLeftWrapper>

        <MoreMenu items={moreMenuItems} />
      </SubsectionTitleWrapper>
      {showingProgressBar && (
        <ProgressBar
          answerFinalizedTimestamp={answerFinalizedTimestamp}
          arbitrationOccurred={arbitrationOccurred}
          bondTimestamp={question.currentAnswerTimestamp}
          creationTimestamp={creationDate}
          pendingArbitration={isPendingArbitration}
          resolutionTimestamp={question.resolution}
          state={marketState}
        ></ProgressBar>
      )}
      <MarketData
        collateralVolume={collateralVolume}
        currency={collateral}
        lastActiveDay={lastActiveDay}
        liquidity={formattedLiquidity}
        resolutionTimestamp={question.resolution}
        runningDailyVolumeByHour={runningDailyVolumeByHour}
      ></MarketData>
      <AdditionalMarketData
        arbitrator={arbitrator}
        category={question.category}
        id={question.id}
        oracle="Reality"
        verified={isVerified}
      ></AdditionalMarketData>
    </>
  )
}

export { MarketTopDetailsOpen }
