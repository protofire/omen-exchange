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

const Value = styled.p<{ isClickable: boolean }>`
  color: ${props => (props.isClickable ? props.theme.colors.primaryLight : props.theme.colors.textColor)};
  cursor: ${props => (props.isClickable ? 'pointer' : 'default')};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  text-transform: capitalize;

  &:hover {
    text-decoration: ${props => (props.isClickable ? 'underline' : 'none')};
  }
`

interface Props {
  onClick?: () => void
  text?: string
  value: string
  symbol: string
}

export const WalletBalance: React.FC<Props> = props => {
  const { onClick, symbol, text = 'Wallet Balance', value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{text}</Title>
      <Value isClickable={!!onClick} onClick={() => onClick && onClick()}>
        {value} {symbol}
      </Value>
    </Wrapper>
  )
}
