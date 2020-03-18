import React from 'react'
import styled from 'styled-components'

import { Textfield } from '../../common'

const Wrapper = styled.div`
  padding: 0 25px 25px 25px;
`

export const Search = () => (
  <Wrapper>
    <Textfield placeholder="Search Market" />
  </Wrapper>
)
