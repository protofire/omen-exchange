import React from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks'
import { truncateStringInTheMiddle } from '../../../util/tools'

import { ConnectionIcon } from './img/ConnectionIcon'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const ConnectionStatusText = styled.span`
  color: ${props => props.theme.header.color};
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    font-size: 14px;
  }
`

const ConnectionStatusDot = styled.div`
  height: 20px;
  margin-right: 5px;
  width: 20px;
`

export const Network: React.FC = props => {
  const context = useConnectedWeb3Context()
  const { account } = context

  if (!account) {
    return null
  }
  return (
    <Wrapper {...props}>
      <ConnectionStatusDot>
        <ConnectionIcon />
      </ConnectionStatusDot>
      <ConnectionStatusText>{truncateStringInTheMiddle(account, 6, 4) || 'No account connected'}</ConnectionStatusText>
    </Wrapper>
  )
}
