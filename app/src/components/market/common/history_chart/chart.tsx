import React from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styled from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'
import { OutcomeItemLittleBallOfJoyAndDifferentColors } from '../common_styled'

const ResponsiveWrapper = styled.div`
  margin: 21px 21px 24.5px 21px;
  border: 1px solid ${props => props.theme.borders.borderDisabled};
  border-radius: 6px;
`
const ChartTooltip = styled.div`
  background: #fff;
  border-radius: 2px;
  border: 1px solid ${props => props.theme.borders.borderDisabled};
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.12);
  min-width: 160px;
  padding: 17px;
`

const TooltipTitle = styled.h4`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 10px;
  text-align: left;
`
const Legends = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const Legend = styled.li`
  align-items: center;
  color: ${props => props.theme.colors.textColor};
  display: flex;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  padding: 0;

  strong {
    color: ${props => props.theme.colors.textColorDarker};
    font-weight: 500;
    margin-right: 6px;
  }
`

const AnEvenSmallerLittleBall = styled(OutcomeItemLittleBallOfJoyAndDifferentColors as any)`
  height: 8px;
  margin-right: 12px;
  width: 8px;
`

const toPercent = (decimal: number, fixed = 0) => {
  return `${(decimal * 100).toFixed(fixed)}%`
}
const renderTooltipContent = (o: any) => {
  const { label, payload } = o

  return (
    <ChartTooltip>
      <TooltipTitle>{label}</TooltipTitle>
      <Legends>
        {payload.reverse().map((entry: any, index: number) => (
          <Legend key={`item-${index}`}>
            <AnEvenSmallerLittleBall outcomeIndex={index} />
            <strong>{`${toPercent(entry.value)}`}</strong>
            {`- ${entry.name}`}
          </Legend>
        ))}
      </Legends>
    </ChartTooltip>
  )
}
type Props = {
  data: { date: string }[]
  outcomes: string[]
}

export const Chart: React.FC<Props> = ({ data, outcomes }) => {
  return (
    <ResponsiveWrapper>
      <ResponsiveContainer height={300} width="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} stackOffset="expand">
          <XAxis dataKey="date" stroke="#E8EAF6" tick={{ fill: '#757575', fontFamily: 'Roboto' }} tickMargin={11} />
          <YAxis
            orientation="right"
            stroke="#E8EAF6"
            tick={{ fill: '#757575', fontFamily: 'Roboto' }}
            tickFormatter={toPercent}
            tickMargin={10}
          />
          <Tooltip content={renderTooltipContent} />

          {outcomes
            .map((outcomeName, index) => {
              const color = getOutcomeColor(index)
              console.log(color)
              return (
                <Area
                  dataKey={outcomeName}
                  fill={color.medium}
                  key={`${index}-${outcomeName}`}
                  stackId="1"
                  stroke={color.darker}
                  type="monotone"
                />
              )
            })
            .reverse()}
        </AreaChart>
      </ResponsiveContainer>
    </ResponsiveWrapper>
  )
}
