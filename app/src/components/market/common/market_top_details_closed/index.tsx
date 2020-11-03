import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import { useConnectedWeb3Context, useGraphMarketMakerData } from '../../../../hooks'
import { useGraphMarketsFromQuestion } from '../../../../hooks/useGraphMarketsFromQuestion'
import theme from '../../../../theme'
import { MarketMakerData, Token } from '../../../../util/types'
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

  const screenEvaluationEquation = window.innerWidth <= parseInt(theme.themeBreakPoints.sm)
  const [isMobile, setIsMobile] = useState(screenEvaluationEquation)

  useEffect(() => {
    setIsMobile(screenEvaluationEquation)
  }, [screenEvaluationEquation])

  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateral: collateralToken,
    collateralVolume,
    curatedByDxDaoOrKleros: isVerified,
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

  const formattedLiquidity: string = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.scaledLiquidityParameter.toFixed(2)
    : '0'

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
          state={'closed'}
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
