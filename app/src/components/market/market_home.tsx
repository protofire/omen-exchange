import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { RemoteData } from '../../util/remote_data'
import { Button } from '../common/button'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { SectionTitle } from '../common/section_title'
import { Filter } from '../common/filter'
import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { Loading } from '../common/loading'

const FilterStyled = styled(Filter)`
  margin: -30px auto 10px;
  max-width: ${props => props.theme.list.maxWidth};
  width: 100%;
`

const NoMarketsAvailable = styled(SectionTitle)`
  margin-top: 150px;
`
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

interface Props {
  markets: RemoteData<any[]>
  count: number
  context: ConnectedWeb3Context
  currentFilter: any
  onFilterChange: (filter: any) => void
  onShowMore: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { count, markets, context, onFilterChange, onShowMore } = props
  const [state, setState] = useState('OPEN')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState<Maybe<string>>(null)

  useEffect(() => {
    onFilterChange({ category, sortBy, state })
  }, [category, sortBy, state])

  const showMoreButton = !RemoteData.is.loading(markets) ? (
    <Button disabled={RemoteData.is.reloading(markets)} onClick={onShowMore}>
      {RemoteData.is.reloading(markets) ? 'Loading...' : 'Show more'}
    </Button>
  ) : null

  return (
    <>
      <SectionTitle title={'MARKETS'} />
      {context.account && (
        <div>
          <ul>
            {CATEGORIES.map((c, index) => (
              <CategoryItem key={index} selected={c === category} onClick={() => setCategory(c)}>
                {c}
              </CategoryItem>
            ))}
          </ul>
          <hr></hr>
          <div className="filters">
            <SelectableButton selected={state === 'OPEN'} onClick={() => setState('OPEN')}>
              Open
            </SelectableButton>
            <SelectableButton selected={state === 'CLOSED'} onClick={() => setState('CLOSED')}>
              Closed
            </SelectableButton>
            <SelectableButton
              selected={state === 'MY_MARKETS'}
              onClick={() => setState('MY_MARKETS')}
            >
              My Markets
            </SelectableButton>
            <button
              onClick={() => {
                sortBy ? setSortBy(null) : setSortBy('collateralVolume')
              }}
            >
              Sort by Volume
            </button>
          </div>
        </div>
      )}
      <ListCard>
        {RemoteData.hasData(markets) &&
          markets.data.length > 0 &&
          markets.data.slice(0, count).map(item => {
            return <ListItem key={item.id} market={item}></ListItem>
          })}
        {RemoteData.is.success(markets) && markets.data.length === 0 && (
          <NoMarketsAvailable title={'No markets available'} />
        )}
        {showMoreButton}
      </ListCard>
      {RemoteData.is.loading(markets) ? <Loading message="Loading markets..." /> : null}
    </>
  )
}
