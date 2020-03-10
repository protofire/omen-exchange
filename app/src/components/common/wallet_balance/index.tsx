import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const Title = styled.h3`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 5px 0 0;
`

const Value = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

interface Props {
  value: string
}

export const WalletBalance: React.FC<Props> = props => {
  const { value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>Wallet Balance</Title>
      <Value>{value}</Value>
    </Wrapper>
  )
}
