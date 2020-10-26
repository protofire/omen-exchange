import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { getMarketTitles } from '../../../../util/tools'
import { Button } from '../../../button'

import { ThreeDots1 } from './img/three_dots_1'
import { ThreeDots2 } from './img/three_dots_2'
import { ThreeDots3 } from './img/three_dots_3'

const ToggleButton = styled(Button)<{ active: boolean }>`
  height: 40px;
  border-radius: 8px;
  ${props => props.active && `border: 1px solid ${props.theme.textfield.borderColorActive}`};

  &:hover {
    ${props => props.active && `border: 1px solid ${props.theme.textfield.borderColorActive}`};
  }

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 100%;
  }
`

const ToggleButtonText = styled.span`
  margin-left: 13px;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  active: boolean
  state: string
  templateId: Maybe<number>
  toggleProgressBar: () => void
}

export const ProgressBarToggle: React.FC<Props> = props => {
  const { active, state, templateId, toggleProgressBar } = props

  const { marketTitle } = getMarketTitles(templateId)

  const marketStates = {
    open: 'open',
    finalizing: 'finalizing',
    arbitration: 'arbitration',
    closed: 'closed',
  }

  return (
    <ToggleButton active={active} onClick={toggleProgressBar}>
      {state === marketStates.open ? (
        <ThreeDots1></ThreeDots1>
      ) : state === marketStates.finalizing ? (
        <ThreeDots2></ThreeDots2>
      ) : state === marketStates.arbitration ? (
        <ThreeDots2></ThreeDots2>
      ) : (
        <ThreeDots3></ThreeDots3>
      )}
      <ToggleButtonText>{marketTitle}</ToggleButtonText>
    </ToggleButton>
  )
}
