import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card } from '../../../common/card'

const CardStyled = styled(Card)`
  margin: 0 auto;
  max-width: 100%;
  min-height: 530px;
  width: ${props => props.theme.mainContainer.maxWidth};
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ListCard: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props
  return (
    <CardStyled noPadding={true} {...restProps}>
      {children}
    </CardStyled>
  )
}
