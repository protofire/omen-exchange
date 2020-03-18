import React from 'react'
import styled from 'styled-components'

import { Textfield } from '../../common'

const SearchWrapper = styled.div`
  padding: 0 25px 25px 25px;
`

export const Search = () => (
  <SearchWrapper>
    <Textfield placeholder="Search Market" />
  </SearchWrapper>
)
