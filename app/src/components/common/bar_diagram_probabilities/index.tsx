import React, { HTMLAttributes } from 'react'
import styled, { withTheme } from 'styled-components'

import WinningOutcomeBadge from './img/badge.svg'
import theme from '../../../theme'

interface ProgressBarProps {
  color?: string
  width: number
}

const BarDiagramWrapper = styled.div`
  display: flex;
  min-width: 100px;
`

const BadgeWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: flex-start;
  width: 26px;
`

const BadgeImg = styled.img`
  display: block;
`

const Outcome = styled.div`
  flex-grow: 1;
`

const OutcomeText = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 0 3px;
`

const OutcomeName = styled.h2`
  color: #000;
  flex-grow: 1;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 15px 0 0;
  text-align: left;
`

const OutcomeValue = styled.p`
  color: #272727;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  text-align: right;
`

const ProgressBar = styled.div`
  background-color: #f5f5f5;
  border-radius: 3px;
  height: 10px;
  overflow: hidden;
`

const Progress = styled.div<ProgressBarProps>`
  background-color: ${props => props.color};
  border-radius: 3px;
  height: 100%;
  width: ${props => props.width}%;
`

interface Props extends HTMLAttributes<HTMLButtonElement> {
  isWinning: boolean
  outcomeName: string
  probability: number
  theme?: any
  winningOutcome: boolean
  withWinningOutcome: boolean
  displayWinningColor?: boolean
}

const BarDiagramComponent: React.FC<Props> = (props: Props) => {
  const {
    outcomeName,
    probability,
    isWinning,
    winningOutcome,
    withWinningOutcome,
    displayWinningColor = true,
  } = props
  const progressColor =
    isWinning && displayWinningColor ? theme.colors.primary : theme.colors.darkGray

  return (
    <BarDiagramWrapper>
      {withWinningOutcome && (
        <BadgeWrapper>
          {winningOutcome ? <BadgeImg src={WinningOutcomeBadge} alt="Winning Outcome" /> : null}
        </BadgeWrapper>
      )}
      <Outcome>
        <OutcomeText>
          <OutcomeName>{outcomeName}</OutcomeName>
          <OutcomeValue>{probability}%</OutcomeValue>
        </OutcomeText>
        <ProgressBar>
          <Progress color={progressColor} width={probability} />
        </ProgressBar>
      </Outcome>
    </BarDiagramWrapper>
  )
}

export const BarDiagram = withTheme(BarDiagramComponent)
