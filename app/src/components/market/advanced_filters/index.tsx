import React from 'react'
import styled from 'styled-components'

import { Dropdown, DropdownItemProps, DropdownPosition } from '../../common/dropdown'
import { DxDaoIcon } from '../../common/icons'
import { BatIcon, DaiIcon, EtherIcon } from '../../common/icons/currencies'
import { TokenItem } from '../token_item'

const Wrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
  margin: 0 25px;
  padding: 20px 0 25px 0;
  row-gap: 20px;

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

export const AdvancedFilters = () => {
  const currencyOptions: Array<DropdownItemProps> = [
    {
      content: <TokenItem icon={<EtherIcon />} text="Ether" />,
      onClick: () => {
        console.warn('Option Ether')
      },
    },
    {
      content: <TokenItem icon={<DaiIcon />} text="DAI" />,
      onClick: () => {
        console.warn('Option DAI')
      },
    },
    {
      content: <TokenItem icon={<BatIcon />} text="Basic Atentio Token" />,
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
      content: <TokenItem icon={<DxDaoIcon />} text="DxDAO" />,
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
