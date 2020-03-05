import { useQuery } from '@apollo/react-hooks'
import React from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { fetchConditionsQuery } from '../../queries/example'
import { getLogger } from '../../util/logger'
import { MarketFilter } from '../../util/market_filter'
import { RemoteData } from '../../util/remote_data'
import { MarketWithExtraData } from '../../util/types'
import { Button } from '../common/button'
import { Filter } from '../common/filter'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { Loading } from '../common/loading'
import { SectionTitle } from '../common/section_title'

const FilterStyled = styled(Filter)`
  margin: -30px auto 10px;
  max-width: ${props => props.theme.mainContainer.maxWidth};
  width: 100%;
`

const NoMarketsAvailable = styled(SectionTitle)`
  margin-top: 150px;
`

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: MarketFilter
  markets: RemoteData<MarketWithExtraData[]>
  moreMarkets: boolean
  onFilterChange: (filter: MarketFilter) => void
  onShowMore: () => void
}

const logger = getLogger('Market::Home')

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { context, count, currentFilter, markets, onFilterChange, onShowMore } = props

  // eslint-disable-next-line no-warning-comments
  // TODO, remove this, only for testing
  const { data } = useQuery(fetchConditionsQuery)
  logger.log(data)

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
          onFilterChange={onFilterChange}
          options={[
            MarketFilter.allMarkets(),
            MarketFilter.fundedMarkets(context.account),
            MarketFilter.predictedOnMarkets(context.account),
            MarketFilter.winningResultMarkets(context.account),
          ]}
        />
      )}
      <ListCard>
        {RemoteData.hasData(markets) &&
          markets.data.length > 0 &&
          markets.data.slice(0, count).map(item => {
            return <ListItem data={item} key={`${item.address}_${item.conditionId}`}></ListItem>
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
