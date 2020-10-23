import React from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { getArbitratorsByNetwork } from '../../../../util/networks'
import { CurationSource } from '../../../../util/types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { CurrencySelector } from '../../common/currency_selector'

import { DxDao } from './img/dxDao'
import { Kleros } from './img/kleros'

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

const LogoWrapper = styled.div`
  margin-right: 6px;
`

const CurationSourceWrapper = styled.div`
  display: flex;
  align-items: center;
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
  curationSource: CurationSource
  onChangeCurrency: (currency: Maybe<string>) => void
  onChangeArbitrator: (arbitrator: Maybe<string>) => void
  onChangeCurationSource: (curationSource: CurationSource) => void
  onChangeTemplateId: (templateId: Maybe<string>) => void
  disableCurationFilter: Maybe<boolean>
}

export const AdvancedFilters = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const arbitrators = getArbitratorsByNetwork(networkId)

  const {
    arbitrator,
    curationSource,
    currency,
    disableCurationFilter,
    onChangeArbitrator,
    onChangeCurationSource,
    onChangeCurrency,
    onChangeTemplateId,
  } = props

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
      if (name === CurationSource.KLEROS) {
        return {
          content: (
            <CurationSourceWrapper>
              <LogoWrapper>
                <Kleros />
              </LogoWrapper>
              {name}
            </CurationSourceWrapper>
          ),
          onClick: () => onChangeArbitrator(address),
        }
      }
      return {
        content: name,
        onClick: () => onChangeArbitrator(address),
      }
    })

  const curationSourceOptions: Array<DropdownItemProps> = [
    {
      content: CurationSource.ALL_SOURCES,
      onClick: () => onChangeCurationSource(CurationSource.ALL_SOURCES),
    },
    {
      content: (
        <CurationSourceWrapper>
          <LogoWrapper>
            <DxDao />
          </LogoWrapper>
          {CurationSource.DXDAO}
        </CurationSourceWrapper>
      ),
      onClick: () => onChangeCurationSource(CurationSource.DXDAO),
    },
    {
      content: (
        <CurationSourceWrapper>
          <LogoWrapper>
            <Kleros />
          </LogoWrapper>
          {CurationSource.KLEROS}
        </CurationSourceWrapper>
      ),
      onClick: () => onChangeCurationSource(CurationSource.KLEROS),
    },
    {
      content: CurationSource.NO_SOURCES,
      onClick: () => onChangeCurationSource(CurationSource.NO_SOURCES),
    },
  ]

  const showQuestionType = false

  const activeArbitratorIndex = arbitrators.findIndex(t => t.address === arbitrator) + 1

  return (
    <Wrapper>
      <Column>
        <Title>Currency</Title>
        <CurrencySelector
          context={context}
          currency={currency}
          disabled={false}
          onSelect={currency => onChangeCurrency(currency.address)}
          placeholder={currency ? '' : 'All'}
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
          currentItem={activeArbitratorIndex}
          dirty={true}
          dropdownPosition={DropdownPosition.center}
          items={arbitratorOptions}
        />
      </Column>
      {!disableCurationFilter && (
        <Column>
          <Title>Verified by</Title>
          <Options
            currentItem={[
              CurationSource.ALL_SOURCES,
              CurationSource.DXDAO,
              CurationSource.KLEROS,
              CurationSource.NO_SOURCES,
            ].findIndex(t => t === curationSource)}
            dirty={true}
            dropdownPosition={DropdownPosition.center}
            items={curationSourceOptions}
          />
        </Column>
      )}
    </Wrapper>
  )
}
