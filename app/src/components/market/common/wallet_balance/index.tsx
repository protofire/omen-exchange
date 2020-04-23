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

const Value = styled.p<{ showPointer: boolean }>`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  ${props => (props.showPointer ? 'cursor: pointer;' : '')}
`

interface Props {
  onClick?: () => void
  text?: string
  value: string
}

export const WalletBalance: React.FC<Props> = props => {
  const { onClick, text = 'Wallet Balance', value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{text}</Title>
      <Value onClick={() => onClick && onClick()} showPointer={!!onClick}>
        {value}
      </Value>
    </Wrapper>
  )
}
