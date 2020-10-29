import { bigNumberify } from 'ethers/utils'
import moment from 'moment'
import React, { useState } from 'react'
import styled, { css } from 'styled-components'

import { useGraphFpmmTradesFromQuestion } from '../../../../hooks/useGraphFpmmTradesFromQuestion'
import { calcPrice } from '../../../../util/tools'
import { HistoricData, Period } from '../../../../util/types'
import { Button, ButtonSelectable } from '../../../button'
import { Dropdown, DropdownPosition } from '../../../common/form/dropdown'
import { InlineLoading } from '../../../loading'

import { Chart } from './chart'
import { MarketTable } from './table'

const commonWrapperCSS = css`
  border-top: 1px solid ${props => props.theme.borders.borderDisabled};
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  width: auto;
`
const DropdownMenu = styled(Dropdown)`
  margin-left: auto;
`

const NoData = styled.div`
  ${commonWrapperCSS}
  align-items: center;
  color: ${props => props.theme.colors.textColorDarker};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  height: 340px;
  justify-content: center;
  letter-spacing: 0.4px;
  line-height: 1.3;
  padding-left: ${props => props.theme.cards.paddingHorizontal};
  padding-right: ${props => props.theme.cards.paddingHorizontal};
`

const CustomInlineLoading = styled(InlineLoading)`
  ${commonWrapperCSS}
  height: 340px;
`

const ChartWrapper = styled.div`
  ${commonWrapperCSS}
`

const TitleWrapper = styled.div`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.borders.borderDisabled};
  display: flex;

  margin: 0 0 -11px;
  // padding-bottom: 20px;
  padding: ${props => props.theme.cards.paddingVertical};
`

const ButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: space-between;
  margin-left: 80px;
`

const SelectWrapper = styled.div`
  display: flex;
`

type Props = {
  holdingSeries: Maybe<HistoricData>
  onChange: (s: Period) => void
  options: Period[]
  outcomes: string[]
  value: Period
  marketMakerAddress: string
}

const ButtonSelectableStyled = styled(ButtonSelectable)<{ active?: boolean }>`
  color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.textColor)};
  margin-left: 5px;

  &:first-child {
    margin-left: 0;
  }
`
const ButtonSelect = styled(Button)`
  margin-right: 10px;
  padding: 20px 15px;
`

const timestampToDate = (timestamp: number, value: string) => {
  const ts = moment(timestamp * 1000)
  if (value === '1D' || value === '1H') return ts.format('HH:mm')

  return ts.format('MMM D')
}

export const HistoryChart: React.FC<Props> = ({
  holdingSeries,
  marketMakerAddress,
  onChange,
  options,
  outcomes,
  value,
}) => {
  const { fpmmTrade, status } = useGraphFpmmTradesFromQuestion(marketMakerAddress)
  const data =
    holdingSeries &&
    holdingSeries
      .filter(h => !!h.block)
      .sort((a, b) => a.block.timestamp - b.block.timestamp)
      .map(h => {
        const prices = calcPrice(h.holdings.map(bigNumberify))
        const outcomesPrices: { [outcomeName: string]: number } = {}
        outcomes.forEach((k, i) => (outcomesPrices[k] = prices[i]))

        return { ...outcomesPrices, date: timestampToDate(h.block.timestamp, value) }
      })
  const [toogleSelect, setToogleSelect] = useState(true)
  const DropdownItems = ['liquidity', 'assets']
  if (!data || status === 'Loading') {
    return <CustomInlineLoading message="Loading Trade History" />
  }
  if (holdingSeries && holdingSeries.length <= 1) {
    return <NoData>There is not enough historical data for this market</NoData>
  }
  return (
    <ChartWrapper>
      <TitleWrapper>
        <SelectWrapper>
          <ButtonSelect onClick={() => setToogleSelect(true)}>Activities</ButtonSelect>
          <ButtonSelect onClick={() => setToogleSelect(false)}>Graph</ButtonSelect>
        </SelectWrapper>

        {!toogleSelect && (
          <ButtonsWrapper>
            {options.map((item, index) => {
              return (
                <ButtonSelectableStyled active={value === item} key={index} onClick={() => onChange(item)}>
                  {item}
                </ButtonSelectableStyled>
              )
            })}
          </ButtonsWrapper>
        )}
        {toogleSelect && (
          <DropdownMenu dropdownPosition={DropdownPosition.right} items={DropdownItems} placeholder={'All'} />
        )}
      </TitleWrapper>
      {toogleSelect ? <MarketTable fpmmTrade={fpmmTrade} status={status} /> : <Chart data={data} outcomes={outcomes} />}
    </ChartWrapper>
  )
}
