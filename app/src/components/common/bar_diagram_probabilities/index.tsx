import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface StyleProps {
  isGreaterThanFifty?: boolean
  barPercentage?: number
  theme?: any
}

const OutcomeBar = styled.div`
  align-items: center;
  border-sizing: border-box;
  border-collapse: collapse;
  color: #00193c;
  display: flex;
  font-size: 13;
  height: 38px;
  line-height: 21px;
  min-width: 200px;
  text-size-adjust: 100%;
`

const Probability = styled.div<StyleProps>`
  border-color: ${props =>
    props.isGreaterThanFifty ? props.theme.colors.primarySoft : props.theme.colors.secondarySoft};
  border-bottom-style: solid;
  border-bottom-width: 2px;
  display: block;
  flex-basis: 0%;
  flex-grow: 1;
  flex-shrink: 1;
  height: 34px;
  margin-bottom: 2px;
  margin-left: 0px;
  margin-right: 0px;
  margin-top: 2px;
  position: relative;
  text-align: center;
`

const Bar = styled.div<StyleProps>`
  background-color: ${props =>
    props.isGreaterThanFifty ? props.theme.colors.primarySoft : props.theme.colors.secondarySoft};
  color: #00193c;
  display: block;
  height: 32px;
  padding-bottom: 4px;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 4px;
  text-align: center;
  width: ${props => props.barPercentage || '50'}%;
`

const LabelAmount = styled.div`
  color: #526877;
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 0px;
  position: absolute;
  right: 10px;
  text-align: center;
  top: 16px;
`

const LabelOutcome = styled.div`
  color: #00193c;
  display: block;
  left: 10px;
  line-height: 0px;
  position: absolute;
  text-align: center;
  top: 16px;
  font-weight: 700;
`

const Icon = styled.div<StyleProps>`
  color: ${props =>
    props.isGreaterThanFifty ? props.theme.colors.primary : props.theme.colors.secondary};
  display: inline-block;
  height: 0px;
  line-height: 0px;
  position: relative;
  text-align: center;
  text-size-adjust: 100%;
  width: 24px;
  font-weight: 700;
  font-style: italic;
  &::after {
    background-color: ${props =>
      props.isGreaterThanFifty ? props.theme.colors.primary : props.theme.colors.secondary};
    border-bottom-left-radius: 100%;
    border-bottom-right-radius: 100%;
    border-top-left-radius: 100%;
    border-top-right-radius: 100%;
    content: '';
    display: block;
    height: 12px;
    left: 6px;
    margin-top: -11px;
    position: absolute;
    width: 12px;
  }
`

const OutcomeName = styled.span`
  color: #00193c;
  line-height: 0px;
  text-align: center;
  text-size-adjust: 100%;
  font-weight: 700;
  font-size: 13px;
`

interface Props extends HTMLAttributes<HTMLButtonElement> {
  outcomeName: string
  probability: number
}

export const BarDiagram: React.FC<Props> = (props: Props) => {
  const { outcomeName, probability } = props

  const isGreaterThanFifty = probability > 50

  return (
    <OutcomeBar>
      <Probability isGreaterThanFifty={isGreaterThanFifty}>
        <LabelOutcome>
          <OutcomeName>{outcomeName}</OutcomeName>
        </LabelOutcome>
        <Bar isGreaterThanFifty={isGreaterThanFifty} barPercentage={probability} />
        <LabelAmount>{probability}%</LabelAmount>
      </Probability>
    </OutcomeBar>
  )
}
