import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card } from '../../../common/card'

const CardStyled = styled(Card)`
  flex: 1;
  padding: 7px 14px;
  position: relative;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const DropdownCard: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props
  return (
    <CardStyled noPadding={true} {...restProps}>
      {children}
    </CardStyled>
  )
}
