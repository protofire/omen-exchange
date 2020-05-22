import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'

const Wrapper = styled.div<{ outcomeIndex: number }>`
  color: ${props => getOutcomeColor(props.outcomeIndex).darker || props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin: 12px 0 0 0;
  text-align: left;
  white-space: nowrap;
`
interface Props extends DOMAttributes<HTMLDivElement> {
  outcomeIndex: number
  value: string
}

export const OwnedShares: React.FC<Props> = (props: Props) => {
  const { value, ...restProps } = props

  return value === '0.00' ? null : <Wrapper {...restProps}>You own {value} Shares</Wrapper>
}
