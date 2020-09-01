import React, { useState } from 'react'

import { formatBigNumber, formatDate, formatNumber } from '../../../../util/tools'
import { MarketMakerData } from '../../../../util/types'
import { useGraphMarketMakerData, useConnectedWeb3Context } from '../../../../hooks'
import { GridTwoColumns, SubsectionTitleAction, SubsectionTitleWrapper } from '../../../common'
import { TitleValue } from '../../../common/text/title_value'
import { Breaker, SubsectionTitleActionWrapper } from '../common_styled'
import { DisplayArbitrator } from '../display_arbitrator'
import { DisplayResolution } from '../display_resolution'
import { HistoryChartContainer } from '../history_chart'
import { MarketTitle } from '../market_title'
import { ProgressBar } from '../progress_bar'
import { MarketData } from '../market_data'
import { AdditionalMarketData } from '../additional_market_data'

interface Props {
  marketMakerData: MarketMakerData
  title?: string
  toggleTitle: string
  isLiquidityProvision: boolean
}

const MarketTopDetailsOpen: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const [showingExtraInformation, setExtraInformation] = useState(false)
  const [showingTradeHistory, setShowingTradeHistory] = useState(false)
  const [tradeHistoryLoaded, setTradeHistoryLoaded] = useState(false)

  const { isLiquidityProvision, marketMakerData, title, toggleTitle } = props
  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateral,
    collateralVolume,
    marketMakerFunding,
    marketMakerUserFunding,
    question,
    totalEarnings,
    userEarnings,
  } = marketMakerData

  const totalVolumeFormat = collateralVolume
    ? `${formatNumber(formatBigNumber(collateralVolume, collateral.decimals))} ${collateral.symbol}`
    : '-'

  const toggleExtraInformation = () => {
    showingExtraInformation ? setExtraInformation(false) : setExtraInformation(true)
    setShowingTradeHistory(false)
  }

  const toggleTradeHistory = () => {
    if (showingTradeHistory) {
      setShowingTradeHistory(false)
    } else {
      setShowingTradeHistory(true)
      // After first load on demand we maintain this value to only load the data when history is shown.
      setTradeHistoryLoaded(true)
    }
    setExtraInformation(false)
  }

  const useGraphMarketMakerDataResult = useGraphMarketMakerData(address, context.networkId)
  const creationTimestamp: string = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.creationTimestamp
    : ''
  const creationDate = new Date(1000 * parseInt(creationTimestamp))

  const currentTimestamp = new Date().getTime()

  const finalizedTimestampDate = answerFinalizedTimestamp && new Date(answerFinalizedTimestamp.toNumber() * 1000)
  const isPendingArbitration = question.isPendingArbitration
  // const arbitrationOccurred

  const marketState = question.resolution.getTime() > currentTimestamp
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
        {/* <SubsectionTitleActionWrapper>
          <SubsectionTitleAction onClick={toggleExtraInformation}>
            {showingExtraInformation ? 'Hide' : 'Show'} {toggleTitle}
          </SubsectionTitleAction>
          <Breaker />
          <SubsectionTitleAction onClick={toggleTradeHistory}>
            {`${showingTradeHistory ? 'Hide' : 'Show'} Trade History`}
          </SubsectionTitleAction>
          <Breaker />
        </SubsectionTitleActionWrapper> */}
      </SubsectionTitleWrapper>
      {/* TODO: Add dynamic props */}
      <ProgressBar 
        state={marketState} 
        creationTimestamp={creationDate} 
        resolutionTimestamp={question.resolution} 
        pendingArbitration={isPendingArbitration} 
        answerFinalizedTimestamp={finalizedTimestampDate}
      ></ProgressBar>
      {/* TODO: Add dynamic props */}
      <MarketData resolutionTimestamp={question.resolution} dailyVolume={collateralVolume} currency={collateral}></MarketData>
      <AdditionalMarketData 
        category={question.category} 
        arbitrator={arbitrator} 
        oracle='Reality.eth' 
        id={question.id}
        showingTradeHistory={showingTradeHistory}
        handleTradeHistoryClick={toggleTradeHistory}
      ></AdditionalMarketData>
      {/* <GridTwoColumns>
        {!isLiquidityProvision ? (
          <>
            <TitleValue title={'Category'} value={question.category} />
            <DisplayResolution questionId={question.id} title={'Resolution Date'} value={question.resolution} />
            <TitleValue title={'Arbitrator'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
            <TitleValue title={'Total Volume'} value={totalVolumeFormat} />
            {showingExtraInformation ? (
              <>
                <TitleValue
                  title={'Total Pool Tokens'}
                  value={collateral && formatNumber(formatBigNumber(marketMakerFunding, collateral.decimals))}
                />
                <TitleValue
                  title={'Total Pool Earnings'}
                  value={
                    collateral &&
                    `${formatNumber(formatBigNumber(totalEarnings, collateral.decimals))} ${collateral.symbol}`
                  }
                />
                <TitleValue
                  title={'My Pool Tokens'}
                  value={collateral && formatNumber(formatBigNumber(marketMakerUserFunding, collateral.decimals))}
                />
                <TitleValue
                  title={'My Pool Earnings'}
                  value={
                    collateral &&
                    `${formatNumber(formatBigNumber(userEarnings, collateral.decimals))} ${collateral.symbol}`
                  }
                />
              </>
            ) : null}
          </>
        ) : (
          <>
            <TitleValue
              title={'Total Pool Tokens'}
              value={collateral && formatNumber(formatBigNumber(marketMakerFunding, collateral.decimals))}
            />
            <TitleValue
              title={'Total Pool Earnings'}
              value={
                collateral &&
                `${formatNumber(formatBigNumber(totalEarnings, collateral.decimals))} ${collateral.symbol}`
              }
            />
            <TitleValue
              title={'My Pool Tokens'}
              value={collateral && formatNumber(formatBigNumber(marketMakerUserFunding, collateral.decimals))}
            />
            <TitleValue
              title={'My Pool Earnings'}
              value={
                collateral && `${formatNumber(formatBigNumber(userEarnings, collateral.decimals))} ${collateral.symbol}`
              }
            />
            {showingExtraInformation ? (
              <>
                <TitleValue title={'Category'} value={question.category} />
                <TitleValue title={'Resolution Date'} value={question.resolution && formatDate(question.resolution)} />
                <TitleValue title={'Arbitrator'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
                <TitleValue title={'Total Volume'} value={totalVolumeFormat} />
              </>
            ) : null}
          </>
        )}
      </GridTwoColumns> */}
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
