import React from 'react'
import styled from 'styled-components'

import { useTokens } from '../../../../hooks'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { getArbitratorsByNetwork } from '../../../../util/networks'
import { MarketValidity } from '../../../../util/types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
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

interface Props {
  currency: Maybe<string>
  arbitrator: Maybe<string>
  marketValidity: MarketValidity
  onChangeCurrency: (currency: Maybe<string>) => void
  onChangeArbitrator: (arbitrator: Maybe<string>) => void
  onChangeMarketValidity: (marketValidity: MarketValidity) => void
  onChangeTemplateId: (templateId: Maybe<string>) => void
}

export const AdvancedFilters = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const arbitrators = getArbitratorsByNetwork(networkId)
  const tokens = useTokens(context)

  const {
    arbitrator,
    currency,
    marketValidity,
    onChangeArbitrator,
    onChangeCurrency,
    onChangeMarketValidity,
    onChangeTemplateId,
  } = props

  const allTokensOptions = [{ address: null, symbol: 'All', image: null }, ...tokens]
  const currencyOptions: Array<DropdownItemProps> = allTokensOptions.map(({ address, image, symbol }) => {
    return {
      content: <TokenItem image={image} text={symbol} />,
      onClick: () => onChangeCurrency(address),
    }
  })

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
      content: 'Categorical',
      onClick: () => onChangeTemplateId('2'),
    },
  ]

  const arbitratorOptions: Array<DropdownItemProps> = [
    { address: null, name: 'All', isSelectionEnabled: true },
    ...arbitrators,
  ]
    .filter(item => {
      return item.isSelectionEnabled
    })
    .map(({ address, name }) => {
      return {
        content: name,
        onClick: () => onChangeArbitrator(address),
      }
    })

  const marketValidityOptions: Array<DropdownItemProps> = [
    {
      content: MarketValidity.VALID,
      onClick: () => onChangeMarketValidity(MarketValidity.VALID),
    },
    {
      content: MarketValidity.INVALID,
      onClick: () => onChangeMarketValidity(MarketValidity.INVALID),
    },
  ]

  const showQuestionType = false

  return (
    <Wrapper>
      <Column>
        <Title>Currency</Title>
        <Options
          currentItem={allTokensOptions.findIndex(t => t.address === currency)}
          dirty={true}
          dropdownPosition={DropdownPosition.left}
          items={currencyOptions}
        />
      </Column>
      {showQuestionType && (
        <Column>
          <Title>Question Type</Title>
          <Options items={questionTypeOptions} />
        </Column>
      )}
      <Column>
        <Title>Arbitrator</Title>
        <Options
          currentItem={arbitrators.findIndex(t => t.address === arbitrator)}
          dirty={true}
          dropdownPosition={DropdownPosition.right}
          items={arbitratorOptions}
        />
      </Column>
      <Column>
        <Title>Market Validity</Title>
        <Options
          currentItem={[MarketValidity.VALID, MarketValidity.INVALID].findIndex(t => t === marketValidity)}
          dirty={true}
          dropdownPosition={DropdownPosition.right}
          items={marketValidityOptions}
        />
      </Column>
    </Wrapper>
  )
}
