import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  padding: 21px;
  position: relative;
  background-image: url(/svgs/border-big.svg);
  background-size: contain;
  background-repeat: no-repeat;
`

export const TransactionDetailsCard: React.FC = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
