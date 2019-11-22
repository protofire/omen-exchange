import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { MarketWithExtraData, MarketFilters, Status } from '../../util/types'
import { FullLoading } from '../common/full_loading'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { SectionTitle } from '../common/section_title'
import { Filter } from '../common/filter'
import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { DisconnectedWeb3Context } from '../../hooks/disconnectedWeb3'

const FilterStyled = styled(Filter)`
  margin: -30px auto 10px;
  max-width: ${props => props.theme.list.maxWidth};
  width: 100%;
`

interface Props {
  markets: MarketWithExtraData[]
  status: Status
  context: ConnectedWeb3Context | DisconnectedWeb3Context
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { status, markets, context } = props
  const options = [MarketFilters.AllMarkets, MarketFilters.MyMarkets]

  const [marketsFiltered, setMarketsFiltered] = useState<MarketWithExtraData[]>([])
  const [currentFilter, setCurrentFilter] = useState<MarketFilters>(MarketFilters.AllMarkets)

  useEffect(() => {
    if (currentFilter === MarketFilters.MyMarkets) {
      setMarketsFiltered(
        markets.filter(
          (market: MarketWithExtraData) =>
            'account' in context &&
            market.ownerAddress.toLowerCase() === context.account.toLowerCase(),
        ),
      )
    } else {
      setMarketsFiltered(markets)
    }
  }, [currentFilter, context, markets])

  return (
    <>
      <SectionTitle title={'MARKETS'} />
      {'account' in context && (
        <FilterStyled
          defaultOption={currentFilter}
          options={options}
          onChange={({ value }: { value: MarketFilters }) => setCurrentFilter(value)}
        />
      )}
      <ListCard>
        {marketsFiltered.map((item: MarketWithExtraData, index: number) => {
          return <ListItem key={index} data={item}></ListItem>
        })}
      </ListCard>
      {status === Status.Loading ? <FullLoading message="Loading markets..." /> : null}
    </>
  )
}
