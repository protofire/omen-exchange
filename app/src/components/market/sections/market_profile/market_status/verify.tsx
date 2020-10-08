import React, { ChangeEvent, useCallback, useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { SubsectionTitle, SubsectionTitleWrapper } from '../../../../common'
import { IconDxDao, IconKleros } from '../../../../common/icons'
import { ViewCard } from '../../../common/view_card'

import Tick from './img/tick.svg'

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
  background-color: ${props => props.selected && props.theme.colors.clickable};
`

const RadioTick = styled.img<StatefulRadioButton>`
  filter: ${props => (props.selected ? 'saturate(0) brightness(2)' : 'saturate(0) brightness(1.6)')};

  ${Row}:hover & {
    filter: 'none';
  }
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
  display: inline-block;
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

export const VerifyMarket = () => {
  const [selection, setSelection] = useState<number | undefined>()
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
      icon: <IconDxDao />,
    },
  ]

  const selectSource = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    setSelection(Number(value))
  }, [])

  return (
    <Card>
      <SubsectionTitleWrapper>
        <SubsectionTitle>Verify</SubsectionTitle>
      </SubsectionTitleWrapper>
      {curationSources.map(({ details, icon: Icon, notice: Notice, option }, index) => (
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
              <RadioWrapper selected={selection === index}>
                <RadioTick alt="tick" selected={selection === index} src={Tick} />
              </RadioWrapper>
            </RightColumn>
          </SubRow>
          <SubRow>{Notice && <div>{Notice}</div>}</SubRow>
          <Input checked={selection === index} name={option} onChange={selectSource} type="radio" value={index} />
        </Row>
      ))}
      <BottomRow>
        <RightButton buttonType={ButtonType.primaryLine} disabled={typeof selection !== 'number'}>
          Request Verification
        </RightButton>
      </BottomRow>
    </Card>
  )
}
