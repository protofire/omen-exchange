import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'
import { HistoryChartContainer } from '../../common/history_chart'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
}

const MarketHistoryWrapper: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props
  const {
    address: marketMakerAddress,
    answerFinalizedTimestamp,
    oracle,
    outcomeTokenMarginalPrices,
    question,
    scalarHigh,
    scalarLow,
  } = marketMakerData

  console.log(marketMakerData)

  return (
    <>
      <HistoryChartContainer
        answerFinalizedTimestamp={answerFinalizedTimestamp}
        hidden={false}
        marketMakerAddress={marketMakerAddress}
        oracle={oracle}
        outcomeTokenMarginalPrices={outcomeTokenMarginalPrices}
        outcomes={question.outcomes}
        scalarHigh={scalarHigh}
        scalarLow={scalarLow}
      />
    </>
  )
}

export const MarketHistory = withRouter(MarketHistoryWrapper)
