import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { IconDxDao } from '../../../../common/icons'
import Tick from '../img/tick.svg'
import {
  CurationCenterColumn,
  CurationLeftColumn,
  CurationOption,
  CurationOptionDetails,
  CurationRadioTick,
  CurationRightColumn,
  CurationRow,
  CurationSubRow,
} from '../market_verify'

const LogoWrapper = styled.div`
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const RadioWrapper = styled.div<StatefulRadioButton>`
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.selected && props.theme.colors.clickable};
`

const Input = styled.input`
  cursor: pointer;
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 5;
  border: 1px solid red;
`

interface StatefulRadioButton {
  selected?: boolean
}

interface Props {
  selection?: number
  selectSource: (e: ChangeEvent<HTMLInputElement>) => void
}

export const DxDaoCuration: React.FC<Props> = (props: Props) => {
  const { selectSource, selection } = props
  return (
    <CurationRow key="Dxdao Curation">
      <CurationSubRow>
        <CurationLeftColumn>
          <LogoWrapper>
            <IconDxDao />
          </LogoWrapper>
        </CurationLeftColumn>
        <CurationCenterColumn>
          <CurationOption>Dxdao Curation</CurationOption>
          <CurationOptionDetails>Request verification</CurationOptionDetails>
        </CurationCenterColumn>
        <CurationRightColumn>
          <RadioWrapper selected={selection === 1}>
            <CurationRadioTick alt="tick" selected={selection === 1} src={Tick} />
          </RadioWrapper>
        </CurationRightColumn>
        <Input checked={selection === 1} onChange={selectSource} type="radio" value={1} />
      </CurationSubRow>
    </CurationRow>
  )
}
