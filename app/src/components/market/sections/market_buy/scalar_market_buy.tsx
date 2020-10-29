import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

const ScalarMarketBuyWrapper: React.FC<Props> = (props: Props) => {
  return <p>Scalar market buy</p>
}

export const ScalarMarketBuy = withRouter(ScalarMarketBuyWrapper)
