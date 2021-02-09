import React from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks'
import { truncateStringInTheMiddle } from '../../../util/tools'
import { IconNotification } from '../icons/IconNotification'

import { ConnectionIcon } from './img/ConnectionIcon'
interface Props {
  claim: boolean
}

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
  margin-right: 8px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    font-size: 14px;
  }
`

const ConnectionStatusDot = styled.div`
  height: 22px;
  width: 22px;
`

export const Network = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, networkId } = context

  if (!account) {
    return null
  }
  return (
    <Wrapper {...props}>
      {props.claim && networkId === 1 && <IconNotification style={{ marginRight: 12 }} />}
      <ConnectionStatusText>{truncateStringInTheMiddle(account, 6, 4) || 'No account connected'}</ConnectionStatusText>
      <ConnectionStatusDot>
        <ConnectionIcon />
      </ConnectionStatusDot>
    </Wrapper>
  )
}
