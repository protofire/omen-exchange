import React from 'react'
<<<<<<< HEAD

import { MarketMakerData } from '../../../../util/types'

interface Props {
=======
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'

interface Props extends RouteComponentProps<any> {
>>>>>>> bcee2cba... Create barebones scalar market pool liquidity view
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

<<<<<<< HEAD
export const ScalarMarketPoolLiquidity = (props: Props) => {
  return <p>scalar pool liquidity</p>
}
=======
const ScalarMarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  return <p>Scalar market pool</p>
}

export const ScalarMarketPoolLiquidity = withRouter(ScalarMarketPoolLiquidityWrapper)
>>>>>>> bcee2cba... Create barebones scalar market pool liquidity view
