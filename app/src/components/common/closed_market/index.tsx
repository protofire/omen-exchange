import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import LockIcon from './img/lock.svg'

const ClosedMarketWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin: 0 auto 10px;
  max-width: ${props => props.theme.mainContainer.maxWidth};
  width: 100%;
`

const Text = styled.span`
  color: #888;
  font-size: 13px;
  font-weight: normal;
  line-height: 1.2;
  margin-left: 8px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  date: string
}

export const ClosedMarket: React.FC<Props> = (props: Props) => {
  const { date, ...restProps } = props

  return (
    <ClosedMarketWrapper {...restProps}>
      <img alt="" src={LockIcon} />
      <Text>Closed on {date}</Text>
    </ClosedMarketWrapper>
  )
}
