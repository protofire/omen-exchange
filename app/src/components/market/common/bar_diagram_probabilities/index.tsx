import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const BarDiagramWrapper = styled.div`
  display: flex;
  min-width: 100px;
`

const Outcome = styled.div`
  flex-grow: 1;
`

const OutcomeText = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 0 10px;
`

const OutcomeName = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  flex-grow: 1;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 15px 0 0;
  text-align: left;
`

const OutcomeValue = styled.p`
  color: ${props => props.theme.colors.textColorDark};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  text-align: right;
`

const ProgressBar = styled.div`
  background-color: #f5f5f5;
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
`

const Progress = styled.div<{ width: number; outcomeIndex: number; selected?: boolean }>`
  background-color: ${props =>
    props.theme.outcomes.colors[props.outcomeIndex].medium
      ? props.selected
        ? props.theme.outcomes.colors[props.outcomeIndex].darker
        : props.theme.outcomes.colors[props.outcomeIndex].medium
      : '#333'};
  border-radius: 4px;
  height: 100%;
  transition: width 0.25s ease-out, background-color 0.25s ease-out;
  width: ${props => props.width}%;
`

Progress.defaultProps = {
  outcomeIndex: 0,
  selected: false,
  width: 0,
}

interface Props extends DOMAttributes<HTMLDivElement> {
  outcomeIndex: number
  outcomeName: string
  probability: number
  selected?: boolean
}

export const BarDiagram: React.FC<Props> = (props: Props) => {
  const { outcomeIndex, outcomeName, probability, selected } = props

  return (
    <BarDiagramWrapper>
      <Outcome>
        <OutcomeText>
          <OutcomeName>{outcomeName}</OutcomeName>
          <OutcomeValue>{probability.toFixed(2)}%</OutcomeValue>
        </OutcomeText>
        <ProgressBar>
          <Progress outcomeIndex={outcomeIndex} selected={selected} width={probability} />
        </ProgressBar>
      </Outcome>
    </BarDiagramWrapper>
  )
}
