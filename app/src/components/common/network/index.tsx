import React from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks'
import { ButtonType } from '../../../theme/component_styles/button_styling_types'
import { truncateStringInTheMiddle } from '../../../util/tools'
import { Button } from '../button'

import { ConnectionIcon } from './img/ConnectionIcon'

const Wrapper = styled(Button)`
  padding-left: 12px;
`

const ConnectionStatusText = styled.span`
  color: ${props => props.theme.header.color};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
`

const ConnectionStatusDot = styled.div`
  height: 20px;
  margin-right: 5px;
  width: 20px;
`

export const Network: React.FC = props => {
  const context = useConnectedWeb3Context()
  const { account } = context
  const { ...restProps } = props

  if (!account) {
    return null
  }
  return (
    <Wrapper buttonType={ButtonType.secondaryLine} {...restProps}>
      <ConnectionStatusDot>
        <ConnectionIcon />
      </ConnectionStatusDot>
      <ConnectionStatusText>{truncateStringInTheMiddle(account, 6, 4) || 'No account connected'}</ConnectionStatusText>
    </Wrapper>
  )
}
