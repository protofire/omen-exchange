import React from 'react'
import styled from 'styled-components'

import { Textfield } from '../../../common'
import { IconSearchGrey } from '../../../common/icons'

const Wrapper = styled.div`
  margin: 0 25px 24px 25px;
  position: relative;
  svg {
    position: absolute;
    left: 13px;
    top: 9px;
  }
`

const SearchTextField = styled(Textfield)`
  height: 40px;
  border-radius: 8px;
  padding-left: 45px;
`

interface Props {
  onChange: (title: string) => void
  value: string
}

export const Search = (props: Props) => {
  const { onChange, value } = props

  return (
    <Wrapper>
      <IconSearchGrey />
      <SearchTextField onChange={e => onChange(e.target.value)} placeholder="Search Market" value={value} />
    </Wrapper>
  )
}
