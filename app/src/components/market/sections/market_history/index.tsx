import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { MarketMakerData } from '../../../../util/types'
import { SectionTitle, TextAlign } from '../../../common/text/section_title'
import { HistoryChartContainer } from '../../common/history_chart'
import { MarketTopDetailsOpen } from '../../common/market_top_details_open'
import { ViewCard } from '../../common/view_card'
import { MarketNavigation } from '../market_navigation'

const TopCard = styled(ViewCard)`
  padding-bottom: 0;
  margin-bottom: 24px;
`

const BottomCard = styled(ViewCard)``

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
}

const MarketHistoryWrapper: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props
  const { address: marketMakerAddress, answerFinalizedTimestamp, isQuestionFinalized, question } = marketMakerData

  return (
    <>
      <SectionTitle goBack={true} textAlign={TextAlign.left} title={question.title} />
      <TopCard>
        <MarketTopDetailsOpen marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={'HISTORY'}
          isQuestionFinalized={isQuestionFinalized}
          marketAddress={marketMakerAddress}
          resolutionDate={question.resolution}
        ></MarketNavigation>
        <HistoryChartContainer
          answerFinalizedTimestamp={answerFinalizedTimestamp}
          hidden={false}
          marketMakerAddress={marketMakerAddress}
          outcomes={question.outcomes}
        />
      </BottomCard>
    </>
  )
}

export const MarketHistory = withRouter(MarketHistoryWrapper)
