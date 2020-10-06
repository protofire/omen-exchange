import React from 'react'
import styled from 'styled-components'

import { Button } from '../../../../button'
import { SubsectionTitle, SubsectionTitleWrapper } from '../../../../common'
import { IconDxDao, IconKleros } from '../../../../common/icons'
import { ViewCard } from '../../../common/view_card'
import { WarningMessage } from '../../../common/warning_message'

import Tick from './img/tick.svg'

const Row = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px;
`
const SubRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: no-wrap;
  justify-content: space-between;
`

const BottomRow = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px 0;
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

const RightButton = styled(Button)`
  margin-left: auto;
`

const Description = styled.p`
  align-items: center;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderColorLighter};
  display: flex;
  padding: 21px 25px;
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 25px 0;
`

interface StatefulRadioButton {
  selected?: boolean
}

export const VerifyMarket = () => {
  const curationSources = [
    {
      option: 'Kleros',
      details: 'Request verification with a 0.331 ETH security deposit.',
      icon: <IconKleros />,
      notice: (
        <Description>
          Make sure your submission complies with the <a href="https://kleros.io">listing criteria</a> to avoid
          challenges. The <b>0.331</b> ETH security deposit will be reimbursed if your submission is accepted. The
          challenge period lasts <b>3 days and 12 hours</b>.
        </Description>
      ),
    },
    {
      option: 'Dxdao Curation',
      details: 'Request Verification',
      icon: IconDxDao,
    },
  ]
  return (
    <Card>
      <SubsectionTitleWrapper>
        <SubsectionTitle>Verify</SubsectionTitle>
      </SubsectionTitleWrapper>
      {curationSources.map(({ details, icon: Icon, notice: Notice, option }) => (
        <Row key={option}>
          <SubRow>
            <LeftColumn>
              <LogoWrapper>{Icon}</LogoWrapper>
            </LeftColumn>
            <CenterColumn>
              <Option>{option}</Option>
              <OptionDetails>{details}</OptionDetails>
            </CenterColumn>
            <RightColumn>
              <RadioWrapper selected>
                <RadioTick alt="tick" selected src={Tick} />
              </RadioWrapper>
            </RightColumn>
          </SubRow>
          <SubRow>{Notice && <div>{Notice}</div>}</SubRow>
        </Row>
      ))}
      <BottomRow>
        <RightButton>Request Verification</RightButton>
      </BottomRow>
    </Card>
  )
}
