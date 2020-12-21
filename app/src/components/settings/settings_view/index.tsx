import React, { useState } from 'react'
import styled from 'styled-components'

import { ButtonRound } from '../../button'
import { Dropdown, DropdownPosition } from '../../common/form/dropdown/index'
import { ListCard } from '../../market/common/list_card/index'
import imgDXdao from '../assets/images/DXdao.svg'
import imgInfura from '../assets/images/Infura.svg'

const TopContent = styled.div`
  padding: 24px;
`
const MainContent = styled.div`
  padding: 24px;
  border-top: ${props => props.theme.borders.borderLineDisabled};
`

const BottomContent = styled(MainContent as any)`
  display: flex;
  justify-content: space-between;
`

const Column = styled.div``

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StatusSection = styled(Row as any)`
  justify-content: flex-start;
  margin-top: 6px;
`

const Text = styled.p`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 16px;
  line-height: 18.75px;
  letter-spacing: 0.4px;
  margin: 0;
`

const TextLighter = styled.p`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 12px;
  line-height: 14.06px;
  margin: 0;
`

const ButtonRow = styled.div`
  display: flex;

  button:first-child {
    margin-right: 12px;
  }
`

const FiltersControls = styled.div<{ disabled?: boolean }>`
  align-items: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};

  @media (min-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-left: 0;
    margin-right: 0;
    padding-left: 10px;
  }
`

const NodeDropdown = styled(Dropdown)`
  min-width: 170px;
`

const CustomDropdownItem = styled.div`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
  letter-spacing: 0.4px;
  color: ${props => props.theme.colors.textColorDark};

  img {
    margin-right: 10px;
  }
`

const StatusBage = styled.div`
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 3px;
  background-color: #55ac68;
`

const Input = styled.input`
  width: 100%;
  margin-top: 20px;
  padding: 12px 20px;
  border: 1px solid ${props => props.theme.colors.tertiary};
  box-sizing: border-box;
  border-radius: 8px;
`

const SettingsViewContainer = () => {
  const [activeTitle, setActiveTitle] = useState('Infura')
  const dropdownList = [
    {
      title: 'Infura',
      image: imgInfura,
      onClick: () => setActiveTitle('Infura'),
    },
    {
      title: 'DXdao',
      image: imgDXdao,
      onClick: () => setActiveTitle('DXdao'),
    },
    {
      title: 'Custom',
      onClick: () => setActiveTitle('Custom'),
    },
  ]

  const filterItems = dropdownList.map(item => {
    return {
      content: (
        <CustomDropdownItem onClick={item.onClick}>
          {item.image && <img alt="node" src={item.image} />}
          {item.title}
        </CustomDropdownItem>
      ),
      secondaryText: '',
      onClick: item.onClick,
    }
  })

  return (
    <ListCard style={{ minHeight: 'initial' }}>
      <TopContent>
        <Text>Settings</Text>
      </TopContent>

      <MainContent>
        <Row>
          <Column>
            <Text>RPC Endpoint</Text>
            <StatusSection>
              <StatusBage />
              <TextLighter>Status: OK</TextLighter>
            </StatusSection>
          </Column>
          <FiltersControls>
            <NodeDropdown currentItem={0} dirty dropdownPosition={DropdownPosition.center} items={filterItems} />
          </FiltersControls>
        </Row>
        {activeTitle === 'Custom' && <Input placeholder="Paste your RPC URL"></Input>}
      </MainContent>

      <BottomContent>
        <ButtonRound>Back</ButtonRound>
        <ButtonRow>
          <ButtonRound>Set to Default</ButtonRound>
          <ButtonRound>Save</ButtonRound>
        </ButtonRow>
      </BottomContent>
    </ListCard>
  )
}

export { SettingsViewContainer }
