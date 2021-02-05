import React from 'react'
import styled from 'styled-components'

import { Token } from '../../../../util/types'
import { IconReceiveAsset } from '../../../common/icons'

const SwitchComponentWrapper = styled.div`
  text-align: right;
  font-size: 14px;
  font-weight: normal;
  line-height: 16px;
  font-style: normal;
  letter-spacing: 0.2px;
  svg {
    padding-top: 1px;
    vertical-align: unset;
    overflow: visible;
  }
`

const SwitchComponentText = styled.div`
  display: inline-block;
  margin-right: 8px;
`

const SwitchComponentTextWrapper = styled.div`
  cursor: pointer;
  display: contents;
  color: ${props => props.theme.colors.clickable};
  &:hover {
    color: ${props => props.theme.colors.primaryLight};
    svg {
      path {
        fill: ${props => props.theme.colors.primaryLight};
      }
    }
  }
`

interface Props {
  onToggleCollateral: any
  toggleCollatral: Token
}

export const SwitchTransactionToken: React.FC<Props> = props => {
  const { onToggleCollateral, toggleCollatral } = props
  return (
    <SwitchComponentWrapper>
      <SwitchComponentTextWrapper onClick={onToggleCollateral}>
        <SwitchComponentText>Receive {toggleCollatral.symbol}</SwitchComponentText>
        <IconReceiveAsset />
      </SwitchComponentTextWrapper>
    </SwitchComponentWrapper>
  )
}
