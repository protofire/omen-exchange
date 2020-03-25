import React from 'react'
import styled from 'styled-components'

import { Dropdown, DropdownItemProps, DropdownPosition } from '../../common/dropdown'
import { TokenItem } from '../token_item'

import { useConnectedWeb3Context } from './../../../hooks/connectedWeb3'
import { getArbitratorsByNetwork, getTokensByNetwork } from './../../../util/networks'
import { DxDaoIcon } from './img/arbitrators'
import { BatIcon, DaiIcon, EtherIcon } from './img/currency'

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

interface Props {
  onChangeCurrency: (currency: string) => void
  onChangeArbitrator: (arbitrator: string) => void
  onChangeTemplateId: (templateId: string) => void
}

export const AdvancedFilters = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const arbitrators = getArbitratorsByNetwork(networkId)
  const tokens = getTokensByNetwork(networkId)

  const { onChangeArbitrator, onChangeCurrency, onChangeTemplateId } = props

  const currencyOptions: Array<DropdownItemProps> = tokens.map(({ address, symbol }, index) => {
    return {
      content: symbol,
      onClick: () => onChangeCurrency(address),
    }
  })
  // [
  //   {
  //     content: <TokenItem icon={<EtherIcon />} text="Ether" />,
  //     onClick: () => {
  //       console.warn('Option Ether')
  //     },
  //   },
  //   {
  //     content: <TokenItem icon={<DaiIcon />} text="DAI" />,
  //     onClick: () => {
  //       console.warn('Option DAI')
  //     },
  //   },
  //   {
  //     content: <TokenItem icon={<BatIcon />} text="Basic Atentio Token" />,
  //     onClick: () => {
  //       console.warn('Option Basic Atention Token')
  //     },
  //   },
  // ]

  const questionTypeOptions: Array<DropdownItemProps> = [
    {
      content: 'Binary',
      onClick: () => onChangeTemplateId('2'),
    },
    {
      content: 'Other',
      onClick: () => onChangeTemplateId('1'),
    },
  ]

  const arbitratorOptions: Array<DropdownItemProps> = arbitrators.map(({ address, name }, index) => {
    return {
      content: name,
      onClick: () => onChangeArbitrator(address),
    }
  })
  // [
  //   {
  //     content: <TokenItem icon={<DxDaoIcon />} text="DxDAO" />,
  //     onClick: () => {
  //       console.warn('Option DxDao')
  //     },
  //   },
  //   {
  //     content: 'Realit.io',
  //     onClick: () => {
  //       console.warn('Option Realit.io')
  //     },
  //   },
  // ]

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
