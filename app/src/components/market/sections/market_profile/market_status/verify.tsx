import React from 'react'
import styled from 'styled-components'

import { SubsectionTitle, SubsectionTitleWrapper } from '../../../../common'
import { IconKleros } from '../../../../common/icons'
import { ViewCard } from '../../../common/view_card'

import Tick from './img/tick.svg'

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: no-wrap;
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px 0;
`

const LeftColumn = styled.div`
  flex-grow: 1;
`

const CenterColumn = styled.div`
  flex-grow: 3;
`

const RightColumn = styled.div`
  flex-grow: 1;
`

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
  ${props => props.selected && `background-color: ${props.theme.colors.clickable};`}
`

const RadioTick = styled.img<StatefulRadioButton>`
  ${props => props.selected && 'filter: saturate(0) brightness(2);'}
`

const Card = styled(ViewCard)`
  margin-bottom: 24px;
`

const Option = styled.div`
  color: ${props => props.theme.colors.textColorDarker};
  font-weight: 500;
`

const OptionDetails = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
`

interface StatefulRadioButton {
  selected?: boolean
}

export const VerifyMarket = () => {
  return (
    <Card>
      <SubsectionTitleWrapper>
        <SubsectionTitle>Verify</SubsectionTitle>
      </SubsectionTitleWrapper>
      <Row>
        <LeftColumn>
          <LogoWrapper>
            <IconKleros />
          </LogoWrapper>
        </LeftColumn>
        <CenterColumn>
          <Option>Kleros</Option>
          <OptionDetails>Request verification with a 0.331 ETH security deposit.</OptionDetails>
        </CenterColumn>
        <RightColumn>
          <RadioWrapper selected>
            <RadioTick alt="tick" selected src={Tick} />
          </RadioWrapper>
        </RightColumn>
      </Row>
    </Card>
  )
}
