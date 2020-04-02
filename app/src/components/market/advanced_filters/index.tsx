import React from 'react'
import styled from 'styled-components'

import { Dropdown, DropdownItemProps, DropdownPosition } from '../../common/dropdown'
// import { DxDaoIcon } from '../../common/icons'
import { BatIcon, DaiIcon, EtherIcon } from '../../common/icons/currencies'
import { TokenItem } from '../token_item'

import { useConnectedWeb3Context } from './../../../hooks/connectedWeb3'
import { getArbitratorsByNetwork, getTokensByNetwork } from './../../../util/networks'

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
  onChangeCurrency: (currency: Maybe<string>) => void
  onChangeArbitrator: (arbitrator: Maybe<string>) => void
  onChangeTemplateId: (templateId: Maybe<string>) => void
}

const currencyIcons: { [index: string]: JSX.Element } = {
  BAT: <BatIcon />,
  DAI: <DaiIcon />,
  ETH: <EtherIcon />,
}

export const AdvancedFilters = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const arbitrators = getArbitratorsByNetwork(networkId)
  const tokens = getTokensByNetwork(networkId)

  const { onChangeArbitrator, onChangeCurrency, onChangeTemplateId } = props

  const currencyOptions: Array<DropdownItemProps> = [{ address: null, symbol: 'All' }, ...tokens].map(
    ({ address, symbol }, index) => {
      const icon = currencyIcons[symbol]
      return {
        content: <TokenItem icon={icon} text={symbol} />,
        onClick: () => onChangeCurrency(address),
      }
    },
  )

  const questionTypeOptions: Array<DropdownItemProps> = [
    {
      content: 'All',
      onClick: () => onChangeTemplateId(null),
    },
    {
      content: 'Binary',
      onClick: () => onChangeTemplateId('0'),
    },
    {
      content: 'Single Select',
      onClick: () => onChangeTemplateId('2'),
    },
  ]

  const arbitratorOptions: Array<DropdownItemProps> = [{ address: null, name: 'All' }, ...arbitrators].map(
    ({ address, name }, index) => {
      return {
        content: name,
        onClick: () => onChangeArbitrator(address),
      }
    },
  )

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
