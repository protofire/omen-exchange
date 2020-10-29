import React from 'react'
<<<<<<< HEAD

import { MarketMakerData } from '../../../../util/types'

interface Props {
=======
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'

interface Props extends RouteComponentProps<any> {
>>>>>>> 4bff4089... Create barebones scalar market sell view
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

<<<<<<< HEAD
export const ScalarMarketSell = (props: Props) => {
  return <p>scalar sell</p>
}
=======
const ScalarMarketSellWrapper: React.FC<Props> = (props: Props) => {
  return <p>Scalar market sell</p>
}

export const ScalarMarketSell = withRouter(ScalarMarketSellWrapper)
>>>>>>> 4bff4089... Create barebones scalar market sell view
