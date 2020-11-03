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
  CurationRadioWrapper,
  CurationRightColumn,
  CurationRow,
  CurationSubRow,
} from '../market_verify'

const Bold = styled.b`
  font-weight: 500;
`

const LogoWrapper = styled.div`
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
`

interface Props {
  option?: number
  selectSource: (option: number) => void
  curatedByDxDao: boolean
}

export const DxDaoCuration: FC<Props> = (props: Props) => {
  const { curatedByDxDao } = props
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
          <CurationOptionDetails>
            {curatedByDxDao ? (
              `Market verified`
            ) : (
              <>
                Request verification and earn <Bold>10 DXdao Reputation</Bold>
              </>
            )}
          </CurationOptionDetails>
        </CurationCenterColumn>
        {!curatedByDxDao && (
          <>
            <CurationRightColumn>
              <CurationRadioWrapper disabled>
                <CurationRadioTick alt="tick" disabled src={Tick} />
              </CurationRadioWrapper>
            </CurationRightColumn>
          </>
        )}
      </CurationSubRow>
    </CurationRow>
  )
}
