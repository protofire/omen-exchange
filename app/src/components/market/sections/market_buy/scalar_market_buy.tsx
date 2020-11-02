import { BigNumber } from 'ethers/utils'
import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

const ScalarMarketBuyWrapper: React.FC<Props> = (props: Props) => {
  // TODO: Remove hardcoded values
  const lowerBound = new BigNumber('0')
  const currentPrediction = new BigNumber('720')
  const upperBound = new BigNumber('1000')
  const unit = 'USD'

  return (
    <>
      <MarketScale
        // TODO: Change to collateral.decimals
        decimals={0}
        lowerBound={lowerBound}
        startingPoint={currentPrediction}
        startingPointTitle={'Current prediction'}
        unit={unit}
        upperBound={upperBound}
      />
    </>
  )
}

export const ScalarMarketBuy = withRouter(ScalarMarketBuyWrapper)
