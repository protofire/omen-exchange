import * as React from 'react'
import { MarketAndQuestion, Status } from '../../util/types'
import { FullLoading } from '../common/full_loading'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { SectionTitle } from '../common/section_title'

interface Props {
  status: Status
  markets: MarketAndQuestion[]
}

export const MarketHome = (props: Props) => {
  const { status, markets } = props

  return (
    <>
      <SectionTitle title={'MARKETS'} />
      <ListCard>
        {markets.map((item, index) => {
          return <ListItem key={index} data={item}></ListItem>
        })}
        {/* <pre>{JSON.stringify(markets, null, 2)}</pre> */}
      </ListCard>
      {status === Status.Loading ? <FullLoading message="Loading markets..." /> : null}
    </>
  )
}
