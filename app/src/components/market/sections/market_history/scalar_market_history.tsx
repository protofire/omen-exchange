import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
}

const ScalarMarketHistoryWrapper: React.FC<Props> = (props: Props) => {
  return <p>Scalar market history</p>
}

export const ScalarMarketHistory = withRouter(ScalarMarketHistoryWrapper)
