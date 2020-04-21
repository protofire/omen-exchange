import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { DragonBallIcon } from '../../../common/icons'

const Wrapper = styled.div<{ outcomeIndex: number }>`
  align-items: center;
  display: flex;
  white-space: nowrap;

  .dragonBallIcon {
    margin: 0 8px 0 0;
  }

  .fill {
    fill: ${props =>
      props.theme.outcomes.colors[props.outcomeIndex].darker
        ? props.theme.outcomes.colors[props.outcomeIndex].darker
        : '#333'};
  }
`

const Text = styled.div<{ outcomeIndex: number }>`
  color: ${props =>
    props.theme.outcomes.colors[props.outcomeIndex].darker
      ? props.theme.outcomes.colors[props.outcomeIndex].darker
      : '#333'};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  index: number
  outcomeName?: string
  payouts: Maybe<number[]>
}

export const WinningBadge: React.FC<Props> = props => {
  const { index, outcomeName = 'Winning Outcome', payouts, ...restProps } = props

  return (
    payouts && (
      <Wrapper outcomeIndex={index} {...restProps}>
        <DragonBallIcon />
        <Text outcomeIndex={index}>
          {payouts[index] < 1 ? `${payouts[index] * 100}% ` : ''} {outcomeName}
        </Text>
      </Wrapper>
    )
  )
}
