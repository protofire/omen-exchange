import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
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
  text?: string
  value: string
}

export const WalletBalance: React.FC<Props> = props => {
  const { text = 'Wallet Balance', value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{text}</Title>
      <Value>{value}</Value>
    </Wrapper>
  )
}
