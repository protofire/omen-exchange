import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card } from '../../../common/card/index'

const CardStyled = styled(Card)`
  max-width: 100%;
  width: ${props => props.theme.mainContainer.maxWidth};
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ViewCard: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props
  return <CardStyled {...restProps}>{children}</CardStyled>
}
