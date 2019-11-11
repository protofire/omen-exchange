import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { MarketAndQuestion, MarketFilters, Status } from '../../util/types'
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
  markets: MarketAndQuestion[]
  status: Status
  context: ConnectedWeb3Context | DisconnectedWeb3Context
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { status, markets, context } = props
  const options = [MarketFilters.AllMarkets, MarketFilters.MyMarkets]
  const defaultOption = options[0]

  const [marketsFiltered, setMarketsFiltered] = useState<MarketAndQuestion[]>([])

  useEffect(() => {
    setMarketsFiltered(markets)
  }, [markets])

  const filterMarkets = (event: { name: string; value: string }) => {
    if (event.value === MarketFilters.MyMarkets) {
      setMarketsFiltered(
        markets.filter(
          (market: MarketAndQuestion) =>
            'account' in context &&
            market.ownerAddress.toLowerCase() === context.account.toLowerCase(),
        ),
      )
    } else {
      setMarketsFiltered(markets)
    }
  }

  return (
    <>
      <SectionTitle title={'MARKETS'} />
      {'account' in context && (
        <FilterStyled defaultOption={defaultOption} options={options} onChange={filterMarkets} />
      )}
      <ListCard>
        {marketsFiltered.map((item: MarketAndQuestion, index: number) => {
          return <ListItem key={index} data={item}></ListItem>
        })}
      </ListCard>
      {status === Status.Loading ? <FullLoading message="Loading markets..." /> : null}
    </>
  )
}
