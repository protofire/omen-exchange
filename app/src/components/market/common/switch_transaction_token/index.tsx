import React from 'react'
import styled from 'styled-components'

import { Token } from '../../../../util/types'
import { IconReceiveAsset } from '../../../common/icons'

const SwitchComponentWrapper = styled.div`
  text-align: right;
  width: 100%;
  color: ${props => props.theme.colors.clickable};
  font-size: 14px;
  font-weight: normal;
  line-height: 16px;
  cursor: pointer;
  font-style: normal;
  letter-spacing: 0.2px;
  svg {
    padding-top: 1px;
    vertical-align: unset;
    overflow: visible;
  }
  &:hover {
    color: ${props => props.theme.colors.primaryLight};
    svg {
      path {
        fill: ${props => props.theme.colors.primaryLight};
      }
    }
  }
`

const SwitchComponentText = styled.div`
  display: inline-block;
  margin-right: 8px;
`

interface Props {
  onToggleCollateral: any
  toggleCollatral: Token
}

export const SwitchTransactionToken: React.FC<Props> = props => {
  const { onToggleCollateral, toggleCollatral } = props
  return (
    <SwitchComponentWrapper onClick={onToggleCollateral}>
      <SwitchComponentText>Receive {toggleCollatral.symbol}</SwitchComponentText> <IconReceiveAsset />
    </SwitchComponentWrapper>
  )
}
