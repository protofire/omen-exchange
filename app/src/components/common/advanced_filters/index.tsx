import React from 'react'
import styled from 'styled-components'

import { Dropdown, DropdownItemProps, DropdownPosition } from '../dropdown'

import { DxDaoIcon } from './img/arbitrators'
import { BatIcon, DaiIcon, EtherIcon } from './img/currency'

const Wrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  column-gap: 20px;
  row-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
  margin: 0 25px;
  padding: 20px 0 25px 0;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const Column = styled.div`
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    max-width: 165px;
  }
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: normal;
  line-height: 1.2;
  margin: 0 0 12px;
`

const Options = styled(Dropdown)`
  max-width: 100%;
`

const Item = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
`

const Icon = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  margin-right: 8px;
  max-height: 100%;

  svg {
    max-height: 100%;
  }
`

const Text = styled.div`
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const getItem = (icon: any, text: string) => {
  return (
    <Item>
      <Icon>{icon}</Icon>
      <Text>{text}</Text>
    </Item>
  )
}

export const AdvancedFilters = () => {
  const currencyOptions: Array<DropdownItemProps> = [
    {
      content: getItem(<EtherIcon />, 'Ether'),
      onClick: () => {
        console.warn('Option Ether')
      },
    },
    {
      content: getItem(<DaiIcon />, 'DAI'),
      onClick: () => {
        console.warn('Option DAI')
      },
    },
    {
      content: getItem(<BatIcon />, 'Basic Atentio Token'),
      onClick: () => {
        console.warn('Option Basic Atention Token')
      },
    },
  ]

  const questionTypeOptions: Array<DropdownItemProps> = [
    {
      content: 'Binary',
      onClick: () => {
        console.warn('Option Binary')
      },
    },
    {
      content: 'Other',
      onClick: () => {
        console.warn('Option Other')
      },
    },
  ]

  const arbitratorOptions: Array<DropdownItemProps> = [
    {
      content: getItem(<DxDaoIcon />, 'DxDAO'),
      onClick: () => {
        console.warn('Option DxDao')
      },
    },
    {
      content: 'Realit.io',
      onClick: () => {
        console.warn('Option Realit.io')
      },
    },
  ]

  return (
    <Wrapper>
      <Column>
        <Title>Currency</Title>
        <Options items={currencyOptions} />
      </Column>
      <Column>
        <Title>Question Type</Title>
        <Options items={questionTypeOptions} />
      </Column>
      <Column>
        <Title>Arbitrator</Title>
        <Options dropdownPosition={DropdownPosition.right} items={arbitratorOptions} />
      </Column>
    </Wrapper>
  )
}
