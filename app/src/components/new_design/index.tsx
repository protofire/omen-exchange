import React, { useState, useEffect } from 'react'
import { Waypoint } from 'react-waypoint'
import { useQuery } from '@apollo/react-hooks'
import { MARKETS } from '../../queries/markets_home'
import { MarketCard } from './market_card'

const NewDesign: React.FC = () => {
  const FIRST = 1
  const SKIP = 1
  const [skip, setSkip] = useState(0)
  const [markets, setMarkets] = useState([] as any)
  const [moreData, setMoreData] = useState(true)
  const { data, loading } = useQuery(MARKETS, { variables: { first: FIRST, skip } })

  useEffect(() => {
    if (data) {
      if (data.fixedProductMarketMakers.length) {
        const { fixedProductMarketMakers } = data
        console.log(data)
        setMarkets([...markets, ...fixedProductMarketMakers])
      } else {
        setMoreData(false)
      }
    }
  }, [data])

  const loadMore = () => {
    setSkip(skip + SKIP)
  }

  return (
    <div>
      {/* <Waypoint onEnter={loadMore}> */}
      <div>
        {markets.map((market: any) => (
          <MarketCard market={market} key={market.id}></MarketCard>
        ))}
      </div>
      {/* </Waypoint> */}
      <button onClick={loadMore} disabled={!moreData}>
        LOAD MORE
      </button>
    </div>
  )
}

export { NewDesign }
