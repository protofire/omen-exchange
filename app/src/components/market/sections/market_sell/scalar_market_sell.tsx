import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

const ScalarMarketSellWrapper: React.FC<Props> = (props: Props) => {
  return <p>Scalar market sell</p>
}

export const ScalarMarketSell = withRouter(ScalarMarketSellWrapper)
