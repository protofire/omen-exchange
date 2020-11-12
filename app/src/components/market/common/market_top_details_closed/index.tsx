import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks'
import { useGraphMarketsFromQuestion } from '../../../../hooks/useGraphMarketsFromQuestion'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import theme from '../../../../theme'
import { MarketMakerData, MarketState, Token } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { AdditionalMarketData } from '../additional_market_data'
import { CurrencySelector } from '../currency_selector'
import { MarketData } from '../market_data'
import { ProgressBar } from '../progress_bar'
import { ProgressBarToggle } from '../progress_bar/toggle'

const SubsectionTitleLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-grow: 1;
  }
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
  collateral: BigNumber
}

const MarketTopDetailsClosed: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { marketMakerData } = props
  const history = useHistory()

  const { width } = useWindowDimensions()
  const isMobile = width <= parseInt(theme.themeBreakPoints.sm)

  const {
    answerFinalizedTimestamp,
    arbitrator,
    collateral: collateralToken,
    collateralVolume,
    creationTimestamp,
    curatedByDxDaoOrKleros: isVerified,
    lastActiveDay,
    question,
    runningDailyVolumeByHour,
    scaledLiquidityParameter,
  } = marketMakerData

  const [showingProgressBar, setShowingProgressBar] = useState(false)

  const creationDate = new Date(1000 * parseInt(creationTimestamp))

  const formattedLiquidity: string = scaledLiquidityParameter ? scaledLiquidityParameter.toFixed(2) : '0'

  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  const { markets: marketsRelatedQuestion } = useGraphMarketsFromQuestion(question.id)

  const toggleProgressBar = () => {
    setShowingProgressBar(!showingProgressBar)
  }

  const onChangeMarketCurrency = (currency: Token | null) => {
    if (currency) {
      const selectedMarket = marketsRelatedQuestion.find(e => e.collateralToken === currency.address.toLowerCase())
      if (selectedMarket && selectedMarket.collateralToken !== collateralToken.address) {
        history.push(`/${selectedMarket.id}`)
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
              currency={collateralToken.address}
              disabled={false}
              filters={marketsRelatedQuestion.map(element => element.collateralToken)}
              onSelect={onChangeMarketCurrency}
              placeholder=""
            />
          )}
          {(!isMobile || marketsRelatedQuestion.length === 1) && (
            <ProgressBarToggle
              active={showingProgressBar}
              state={'closed'}
              templateId={question.templateId}
              toggleProgressBar={toggleProgressBar}
            ></ProgressBarToggle>
          )}
        </SubsectionTitleLeftWrapper>
      </SubsectionTitleWrapper>
      {showingProgressBar && (
        <ProgressBar
          answerFinalizedTimestamp={answerFinalizedTimestamp}
          arbitrationOccurred={arbitrationOccurred}
          creationTimestamp={creationDate}
          pendingArbitration={isPendingArbitration}
          resolutionTimestamp={question.resolution}
          state={MarketState.closed}
        ></ProgressBar>
      )}
      <MarketData
        collateralVolume={collateralVolume}
        currency={collateralToken}
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

export { MarketTopDetailsClosed }
