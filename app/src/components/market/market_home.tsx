import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { RemoteData } from '../../util/remote_data'
import { Button } from '../common/button'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { Loading } from '../common/loading'
import { SectionTitle } from '../common/section_title'
import { CATEGORIES } from '../../common/constants'

const NoMarketsAvailable = styled(SectionTitle)`
  margin-top: 150px;
`
const CATEGORIES_WITH_ALL = ['All', ...CATEGORIES]

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
  moreMarkets: boolean
  onFilterChange: (filter: any) => void
  onShowMore: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { context, count, markets, moreMarkets, onFilterChange, onShowMore } = props
  const [state, setState] = useState('OPEN')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState<Maybe<string>>(null)

  useEffect(() => {
    onFilterChange({ category, sortBy, state })
  }, [category, sortBy, state, onFilterChange])

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
            {CATEGORIES_WITH_ALL.map((c, index) => (
              <CategoryItem key={index} onClick={() => setCategory(c)} selected={c === category}>
                {c}
              </CategoryItem>
            ))}
          </ul>
          <hr></hr>
          <div className="filters">
            <SelectableButton onClick={() => setState('OPEN')} selected={state === 'OPEN'}>
              Open
            </SelectableButton>
            <SelectableButton onClick={() => setState('CLOSED')} selected={state === 'CLOSED'}>
              Closed
            </SelectableButton>
            <SelectableButton onClick={() => setState('MY_MARKETS')} selected={state === 'MY_MARKETS'}>
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
        {moreMarkets && showMoreButton}
      </ListCard>
      {RemoteData.is.loading(markets) ? <Loading message="Loading markets..." /> : null}
    </>
  )
}
