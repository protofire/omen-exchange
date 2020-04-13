import React from 'react'
import styled from 'styled-components'

import { Textfield } from '../../../common'

const Wrapper = styled.div`
  padding: 0 25px 25px 25px;
`

interface Props {
  onChange: (title: string) => void
  value: string
}

export const Search = (props: Props) => {
  const { onChange, value } = props

  return (
    <Wrapper>
      <Textfield onChange={e => onChange(e.target.value)} placeholder="Search Market" value={value} />
    </Wrapper>
  )
}
