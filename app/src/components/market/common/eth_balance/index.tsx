import React from 'react'
import styled from 'styled-components'

import { TokenEthereum } from '../../../../util/types'
import { EtherIcon } from '../../../common/icons/currencies'

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

interface Props {
  value?: string
}

export const EthBalance: React.FC<Props> = props => {
  const { value = '0.00', ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <EtherIcon />
      <Title>{TokenEthereum.symbol}</Title>
      <Value>{value}</Value>
    </Wrapper>
  )
}
