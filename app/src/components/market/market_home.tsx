import React from 'react'
import styled from 'styled-components'

import { MarketWithExtraData } from '../../util/types'
import { MarketFilter } from '../../util/market_filter'
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

interface Props {
  markets: RemoteData<MarketWithExtraData[]>
  count: number
  moreMarkets: boolean
  context: ConnectedWeb3Context
  currentFilter: MarketFilter
  onFilterChange: (filter: MarketFilter) => void
  onShowMore: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { count, markets, context, currentFilter, onFilterChange, onShowMore } = props

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
          options={[
            MarketFilter.allMarkets(),
            MarketFilter.fundedMarkets(context.account),
            MarketFilter.predictedOnMarkets(context.account),
            MarketFilter.winningResultMarkets(context.account),
          ]}
          onFilterChange={onFilterChange}
        />
      )}
      <ListCard>
        {RemoteData.hasData(markets) &&
          markets.data.length > 0 &&
          markets.data.slice(0, count).map(item => {
            return <ListItem key={`${item.address}_${item.conditionId}`} data={item}></ListItem>
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
