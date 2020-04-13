import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div<{ outcomeIndex: number }>`
  color: ${props => props.theme.outcomes.colors[props.outcomeIndex].darker || props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin: 12px 0 0 0;
  text-align: left;
`
interface Props extends DOMAttributes<HTMLDivElement> {
  outcomeIndex: number
  value: any
}

export const OwnedShares: React.FC<Props> = (props: Props) => {
  const { value, ...restProps } = props
  return <Wrapper {...restProps}>You own {value} Shares</Wrapper>
}
