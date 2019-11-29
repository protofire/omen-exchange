import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface ProbabilityProps {
  isWinning: boolean
  theme?: any
}

interface BarProps {
  isWinning: boolean
  percentage: number
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

const Probability = styled.div<ProbabilityProps>`
  border-color: ${props =>
    props.isWinning ? props.theme.colors.primarySoft : props.theme.colors.secondarySoft};
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

const Bar = styled.div<BarProps>`
  background-color: ${props =>
    props.isWinning ? props.theme.colors.primarySoft : props.theme.colors.secondarySoft};
  color: #00193c;
  display: block;
  height: 32px;
  padding-bottom: 4px;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 4px;
  text-align: center;
  width: ${props => props.percentage}%;
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
  isWinning: boolean
}

export const BarDiagram: React.FC<Props> = (props: Props) => {
  const { outcomeName, probability, isWinning } = props

  return (
    <OutcomeBar>
      <Probability isWinning={isWinning}>
        <LabelOutcome>
          <OutcomeName>{outcomeName}</OutcomeName>
        </LabelOutcome>
        <Bar isWinning={isWinning} percentage={probability} />
        <LabelAmount>{probability}%</LabelAmount>
      </Probability>
    </OutcomeBar>
  )
}
