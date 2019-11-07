import React, { HTMLAttributes } from 'react'
import { Card } from '../card'
import styled from 'styled-components'

const CardStyled = styled(Card)`
  margin: 0 auto;
  max-width: 620px;
  min-height: 530px;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ListCard: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props
  return <CardStyled {...restProps}>{children}</CardStyled>
}
