import React from 'react'
import styled from 'styled-components'

import { ButtonRound } from '../../../button/button_round'

interface Props {
  open: boolean
}

const BridgeWrapper = styled(ButtonRound)<{ isOpen: boolean }>`
  ${props => (!props.isOpen ? 'display:none' : '')};
  position: absolute;
  top: calc(100% + 8px);
  width: 207.27px;
  right: 207.27px;
  z-index: 4321;
`

export const XdaiBridgeTransfer: React.FC<Props> = props => {
  console.log(props)
  return (
    <BridgeWrapper isOpen={props.open}>
      <div>Milan</div>
    </BridgeWrapper>
  )
}
