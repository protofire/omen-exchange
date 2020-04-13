import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  border: 1px solid ${props => props.theme.borders.borderColor};
  padding: 21px;
`

export const TransactionDetailsCard: React.FC = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
