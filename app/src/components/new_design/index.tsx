import React, { useState } from 'react'
import { Waypoint } from 'react-waypoint'
import { useQuery } from '@apollo/react-hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { marketsVolumeQuery } from '../../queries/markets_home'

const NewDesign: React.FC = () => {
  const context = useConnectedWeb3Context()
  const { data } = useQuery(marketsVolumeQuery)

  if (!data) {
    return null
  }
  const { fixedProductMarketMakers } = data
  console.log(fixedProductMarketMakers)
  return (
    <div>
      {fixedProductMarketMakers.map((market: any) => {
        console.log('Market', market)
        return (
          <div key={market.id}>
            {market.id}
            {market.collateralVolume} {market.conditions[0].question.data}
          </div>
        )
      })}
    </div>
  )
}

export { NewDesign }
