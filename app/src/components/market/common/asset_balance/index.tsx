import React from 'react'
import styled from 'styled-components'

import { Token } from '../../../../util/types'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 13px;
  height: 40px;
  border-radius: 8px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
`

const Title = styled.h3`
  color: ${props => props.theme.colors.textColorDark};
  font-size: ${props => props.theme.fonts.defaultSize};
  font-weight: 400;
  line-height: 16px;
  margin-left: 10px;
  flex: 1;
`

const Value = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: ${props => props.theme.fonts.defaultSize};
  font-weight: 400;
  line-height: 16px;
  margin: 0;
  text-transform: capitalize;
`

const Image = styled.img`
  height: 24px;
  width: 24px;
`

interface Props {
  value?: string
  asset: Token
}

export const AssetBalance: React.FC<Props> = props => {
  const { asset, value = '0.00', ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Image src={asset.image} />
      <Title>{asset.symbol}</Title>
      <Value>{value}</Value>
    </Wrapper>
  )
}
