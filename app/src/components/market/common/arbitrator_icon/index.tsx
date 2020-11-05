import React from 'react'
import styled from 'styled-components'

import { IconKleros } from '../../../common/icons'

interface Props {
  id: Maybe<string>
}

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`

export const ArbitratorIcon = ({ id }: Props) => {
  switch (id) {
    case 'kleros':
      return (
        <IconWrapper>
          <IconKleros />
        </IconWrapper>
      )
    default:
      return null
  }
}
