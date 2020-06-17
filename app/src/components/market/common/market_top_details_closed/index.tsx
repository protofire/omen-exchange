import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'

import { LINK_FAQ } from '../../../../common/constants'
import { formatBigNumber, formatDate, getMarketTitles } from '../../../../util/tools'
import { MarketMakerData } from '../../../../util/types'
import { GridTwoColumns, SubsectionTitleAction, SubsectionTitleWrapper, TitleValue } from '../../../common'
import { Breaker, SubsectionTitleActionWrapper } from '../common_styled'
import { DisplayArbitrator } from '../display_arbitrator'
import { HistoryChartContainer } from '../history_chart'
import { MarketTitle } from '../market_title'

interface Props {
  marketMakerData: MarketMakerData
  collateral: BigNumber
}

const SUB_LINK = '#heading=h.9awaoq9ub17q'

const MarketTopDetailsClosed: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateral: collateralToken,
    collateralVolume,
    question,
  } = marketMakerData

  const resolutionFormat = question.resolution ? formatDate(question.resolution) : ''
  const totalVolumeFormat = collateralVolume
    ? `${formatBigNumber(collateralVolume, collateralToken.decimals)} ${collateralToken.symbol}`
    : '-'

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

  const { marketSubtitle } = getMarketTitles(question.templateId)

  return (
    <>
      <SubsectionTitleWrapper>
        <MarketTitle templateId={question.templateId} />
        <SubsectionTitleActionWrapper>
          {LINK_FAQ && (
            <SubsectionTitleActionWrapper>
              <SubsectionTitleAction
                onClick={() => {
                  window.open(`${LINK_FAQ}${SUB_LINK}`)
                }}
              >
                {marketSubtitle}
              </SubsectionTitleAction>
            </SubsectionTitleActionWrapper>
          )}
          <Breaker />
          <SubsectionTitleAction onClick={toggleTradeHistory}>
            {`${showingTradeHistory ? 'Hide' : 'Show'} Trade History`}
          </SubsectionTitleAction>
        </SubsectionTitleActionWrapper>
      </SubsectionTitleWrapper>
      <GridTwoColumns>
        <TitleValue title={'Category'} value={question.category} />
        <TitleValue title={'Earliest Resolution Date'} value={resolutionFormat} />
        <TitleValue title={'Arbitrator/Oracle'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
        <TitleValue title={'Total Volume'} value={totalVolumeFormat} />
      </GridTwoColumns>
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
