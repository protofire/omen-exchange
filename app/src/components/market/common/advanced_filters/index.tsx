import React from 'react'
import styled from 'styled-components'

import { useTokens } from '../../../../hooks'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { getArbitratorsByNetwork } from '../../../../util/networks'
import { MarketSource } from '../../../../util/types'
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
  marketSource: MarketSource
  onChangeCurrency: (currency: Maybe<string>) => void
  onChangeArbitrator: (arbitrator: Maybe<string>) => void
  onChangeMarketSource: (marketSource: MarketSource) => void
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
    marketSource,
    onChangeArbitrator,
    onChangeCurrency,
    onChangeMarketSource,
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

  const marketSourceOptions: Array<DropdownItemProps> = [
    {
      content: MarketSource.ALL_SOURCES,
      onClick: () => onChangeMarketSource(MarketSource.ALL_SOURCES),
    },
    {
      content: MarketSource.DXDAO,
      onClick: () => onChangeMarketSource(MarketSource.DXDAO),
    },
    {
      content: MarketSource.KLEROS,
      onClick: () => onChangeMarketSource(MarketSource.KLEROS),
    },
    {
      content: MarketSource.NO_SOURCES,
      onClick: () => onChangeMarketSource(MarketSource.NO_SOURCES),
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
          maxHeight={true}
          showScrollbar={true}
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
        <Title>Curation Source</Title>
        <Options
          currentItem={[
            MarketSource.ALL_SOURCES,
            MarketSource.DXDAO,
            MarketSource.KLEROS,
            MarketSource.NO_SOURCES,
          ].findIndex(t => t === marketSource)}
          dirty={true}
          dropdownPosition={DropdownPosition.right}
          items={marketSourceOptions}
        />
      </Column>
    </Wrapper>
  )
}
