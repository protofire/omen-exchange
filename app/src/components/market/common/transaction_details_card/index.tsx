import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  border: 1px solid ${props => props.theme.borders.borderColor};
  border-bottom: none;
  padding: 21px;
  padding-bottom: 0;
`

export const TransactionDetailsCard: React.FC = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
