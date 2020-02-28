import React, { useState, useEffect } from 'react'
import { Waypoint } from 'react-waypoint'
import { useQuery } from '@apollo/react-hooks'
import { MARKETS_HOME } from '../../queries/markets_home'
import { MarketCard } from './market_card'
import styled from 'styled-components'
import { Loading } from '../common/loading'

const SelectableButton = styled.div<{ selected?: boolean }>`
  background: ${(props: any) => (props.selected ? 'aquamarine' : 'initial')};
`
const NewDesign: React.FC = () => {
  const FIRST = 10
  const NOW = Math.floor(Date.now() / 1000)

  const [skip, setSkip] = useState(0)
  const [markets, setMarkets] = useState([] as any)
  const [filterSelected, setFilterSelected] = useState('OPEN')
  const [orderCriteria, setOrderCriteria] = useState<Maybe<string>>(null)
  const { data, loading } = useQuery(MARKETS_HOME[filterSelected], {
    variables: { first: FIRST, skip, criteria: orderCriteria, now: NOW },
  })

  useEffect(() => {
    if (data) {
      const { fixedProductMarketMakers } = data
      if (fixedProductMarketMakers.length) {
        setMarkets([...markets, ...fixedProductMarketMakers])
      }
    }
  }, [data])

  const loadMore = () => {
    setSkip(skip + FIRST)
  }

  const resetPagination = () => {
    setMarkets([])
    setSkip(0)
  }

  const changeFilterSelected = (filter: string) => {
    resetPagination()
    setFilterSelected(filter)
  }

  if (loading) {
    return <Loading full={true}></Loading>
  }

  return (
    <div>
      <hr></hr>
      <div className="filters">
        <SelectableButton
          selected={filterSelected === 'OPEN'}
          onClick={() => changeFilterSelected('OPEN')}
        >
          Open
        </SelectableButton>
        <SelectableButton
          selected={filterSelected === 'CLOSED'}
          onClick={() => changeFilterSelected('CLOSED')}
        >
          Closed
        </SelectableButton>
        <SelectableButton
          selected={filterSelected === 'MY_MARKETS'}
          onClick={() => changeFilterSelected('MY_MARKETS')}
        >
          My Markets
        </SelectableButton>
        <button
          onClick={() => {
            resetPagination()
            orderCriteria ? setOrderCriteria(null) : setOrderCriteria('collateralVolume')
          }}
        >
          Sort by Volume
        </button>
      </div>
      <hr></hr>
      {/* <Waypoint onEnter={loadMore}> */}
      <div>
        {markets.map((market: any) => (
          <MarketCard market={market} key={market.id}></MarketCard>
        ))}
      </div>
      {/* </Waypoint> */}
      <button onClick={loadMore}>LOAD MORE</button>
    </div>
  )
}

export { NewDesign }
