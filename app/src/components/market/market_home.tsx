import React from 'react'
import styled from 'styled-components'

import { MarketWithExtraData, MarketFilters } from '../../util/types'
import { RemoteData } from '../../util/remote_data'
import { Button } from '../common/button'
import { FullLoading } from '../common/full_loading'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { SectionTitle } from '../common/section_title'
import { Filter } from '../common/filter'
import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'

const FilterStyled = styled(Filter)`
  margin: -30px auto 10px;
  max-width: ${props => props.theme.list.maxWidth};
  width: 100%;
`

interface Props {
  markets: RemoteData<MarketWithExtraData[]>
  count: number
  moreMarkets: boolean
  context: ConnectedWeb3Context
  currentFilter: MarketFilters
  onFilterChange: (filter: MarketFilters) => void
  onShowMore: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { count, markets, context, currentFilter, onFilterChange, onShowMore } = props
  const options = [MarketFilters.AllMarkets, MarketFilters.MyMarkets, MarketFilters.FundedMarkets]

  const showMoreButton =
    props.moreMarkets && !RemoteData.is.loading(markets) ? (
      <Button disabled={RemoteData.is.reloading(markets)} onClick={onShowMore}>
        {RemoteData.is.reloading(markets) ? 'Loading...' : 'Show more'}
      </Button>
    ) : null

  return (
    <>
      <SectionTitle title={'MARKETS'} />
      {context.account && (
        <FilterStyled
          defaultOption={currentFilter}
          options={options}
          onChange={({ value }: { value: MarketFilters }) => onFilterChange(value)}
        />
      )}
      <ListCard>
        {RemoteData.hasData(markets)
          ? markets.data.slice(0, count).map(item => {
              return <ListItem key={item.conditionId} data={item}></ListItem>
            })
          : null}
        {showMoreButton}
      </ListCard>
      {RemoteData.is.loading(markets) ? <FullLoading message="Loading markets..." /> : null}
    </>
  )
}
