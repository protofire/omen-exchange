import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card } from '../card'

const CardStyled = styled(Card)`
  margin: 0 auto;
  max-width: ${props => props.theme.mainContainer.maxWidth};
  min-height: 530px;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CreateCard: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props
  return <CardStyled {...restProps}>{children}</CardStyled>
}
