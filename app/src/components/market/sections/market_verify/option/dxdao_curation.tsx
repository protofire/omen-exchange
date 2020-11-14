import React, { FC } from 'react'
import styled from 'styled-components'

import { IconDxDao, IconTick } from '../../../../common/icons'
import {
  CurationCenterColumn,
  CurationLeftColumn,
  CurationLogoWrapper,
  CurationOption,
  CurationOptionDetails,
  CurationRadioWrapper,
  CurationRightColumn,
  CurationRow,
  CurationSubRow,
} from '../market_verify'

const Bold = styled.b`
  font-weight: 500;
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
          <CurationLogoWrapper>
            <IconDxDao />
          </CurationLogoWrapper>
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
                <IconTick disabled={true} />
              </CurationRadioWrapper>
            </CurationRightColumn>
          </>
        )}
      </CurationSubRow>
    </CurationRow>
  )
}
