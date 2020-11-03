import React, { FC } from 'react'
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
  border: 1px solid ${props => props.theme.buttonPrimaryLine.borderColorDisabled};
  cursor: pointer;
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.selected && props.theme.colors.clickable};

  &:hover {
    border: 1px solid ${props => props.theme.colors.tertiary};
  }
`

interface StatefulRadioButton {
  selected?: boolean
}

interface Props {
  option?: number
  selectSource: (option: number) => void
  curatedByDxDao: boolean
}

const DXDAO_OPTION = 1

export const DxDaoCuration: FC<Props> = (props: Props) => {
  const { curatedByDxDao, option, selectSource } = props
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
          <CurationOptionDetails>{curatedByDxDao ? `Market verified` : 'Request verification'}</CurationOptionDetails>
        </CurationCenterColumn>
        {!curatedByDxDao && (
          <>
            <CurationRightColumn>
              <RadioWrapper onClick={() => selectSource(DXDAO_OPTION)} selected={option === 1}>
                <CurationRadioTick alt="tick" selected={option === DXDAO_OPTION} src={Tick} />
              </RadioWrapper>
            </CurationRightColumn>
          </>
        )}
      </CurationSubRow>
    </CurationRow>
  )
}
