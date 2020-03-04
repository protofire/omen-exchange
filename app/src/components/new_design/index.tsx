import React, { useState, useEffect } from 'react'
import { Waypoint } from 'react-waypoint'
import { useQuery } from '@apollo/react-hooks'
import { MARKETS_HOME } from '../../queries/markets_home'
import { MarketCard } from './market_card'
import styled from 'styled-components'
import { Loading } from '../common/loading'
import { CPKService } from '../../services/cpk'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'

const CATEGORIES = ['All', 'Politics', 'Cryptocurrencies', 'Sports', 'Esports', 'NBA']
const SelectableButton = styled.div<{ selected?: boolean }>`
  background: ${(props: any) => (props.selected ? 'aquamarine' : 'initial')};
`

const CategoryItem = styled.li<{ selected?: boolean }>`
  background: ${(props: any) => (props.selected ? 'yellow' : 'initial')};
  margin-left: 1px;
  border-style: solid;
  padding: 3px;
  border-width: 0.5px;
  display: inline;
`

const NewDesign: React.FC = () => {
  const FIRST = 1
  const NOW = Math.floor(Date.now() / 1000)

  const [skip, setSkip] = useState(0)
  const [markets, setMarkets] = useState([] as any)
  const [filterSelected, setFilterSelected] = useState('OPEN')
  const [category, setCategory] = useState('All')
  const [orderCriteria, setOrderCriteria] = useState<Maybe<string>>(null)
  const [cpkAddress, setCpkAddress] = useState<Maybe<string>>(null)

  const context = useConnectedWeb3Context()
  const { library: provider } = context

  const { data, loading, error } = useQuery(MARKETS_HOME[filterSelected], {
    fetchPolicy: 'no-cache',
    variables: { first: FIRST, skip, criteria: orderCriteria, now: NOW, account: cpkAddress },
  })

  console.log(loading, error)

  useEffect(() => {
    const getCpkAddress = async () => {
      const cpk = await CPKService.create(provider)
      setCpkAddress(cpk.address)
    }

    getCpkAddress()
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

  const changeCategorySelected = (category: string) => {
    setCategory(category)
  }

  if (loading) {
    return <Loading full={true}></Loading>
  }

  return (
    <div>
      <ul>
        {CATEGORIES.map((c, index) => (
          <CategoryItem
            key={index}
            selected={c === category}
            onClick={() => changeCategorySelected(c)}
          >
            {c}
          </CategoryItem>
        ))}
      </ul>
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
