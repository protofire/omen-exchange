import * as React from 'react'
import { MarketAndQuestion, Status } from '../../util/types'
import { FullLoading } from '../common/full_loading'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { SectionTitle } from '../common/section_title'
import { Filter } from '../common/filter'
import styled from 'styled-components'

const FilterStyled = styled(Filter)`
  margin: -30px auto 10px;
  max-width: ${props => props.theme.list.maxWidth};
  width: 100%;
`

interface Props {
  markets: MarketAndQuestion[]
  status: Status
}

export const MarketHome = (props: Props) => {
  const { status, markets } = props
  const options = ['All Markets', 'My Markets']
  const defaultOption = options[0]

  return (
    <>
      <SectionTitle title={'MARKETS'} />
      <FilterStyled
        defaultOption={defaultOption}
        options={options}
        onChange={() => {
          console.log('Select!')
        }}
      />
      <ListCard>
        {markets.map((item, index) => {
          return <ListItem key={index} data={item}></ListItem>
        })}
      </ListCard>
      {status === Status.Loading ? <FullLoading message="Loading markets..." /> : null}
    </>
  )
}
