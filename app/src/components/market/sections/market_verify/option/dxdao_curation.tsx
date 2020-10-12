import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { IconDxDao } from '../../../../common/icons'
import Tick from '../img/tick.svg'

const Row = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px;
  position: relative;
`
const SubRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: no-wrap;
  justify-content: space-between;
  position: relative;
`

const LeftColumn = styled.div``

const CenterColumn = styled.div`
  width: 75%;
`

const RightColumn = styled.div``

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

const RadioTick = styled.img<StatefulRadioButton>`
  filter: ${props => (props.selected ? 'saturate(0) brightness(2)' : 'saturate(0) brightness(1.6)')};

  ${SubRow}:hover & {
    filter: ${props => !props.selected && 'none'};
  }
`

const Option = styled.div`
  color: ${props => props.theme.colors.textColorDarker};
  font-weight: 500;
`

const OptionDetails = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
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
    <Row key="Dxdao Curation">
      <SubRow>
        <LeftColumn>
          <LogoWrapper>
            <IconDxDao />
          </LogoWrapper>
        </LeftColumn>
        <CenterColumn>
          <Option>Dxdao Curation</Option>
          <OptionDetails>Request verification</OptionDetails>
        </CenterColumn>
        <RightColumn>
          <RadioWrapper selected={selection === 1}>
            <RadioTick alt="tick" selected={selection === 1} src={Tick} />
          </RadioWrapper>
        </RightColumn>
        <Input checked={selection === 1} onChange={selectSource} type="radio" value={1} />
      </SubRow>
    </Row>
  )
}
