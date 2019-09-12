import React, { Component } from 'react'
import styled from 'styled-components'

import { StepType } from './types'

interface Props {
  currentStep: StepType
}

interface State {
  steps: StepItem[]
}

interface StepItem {
  type: StepType
  name: string
  value: number
}

interface DivProp {
  active?: boolean
  key?: number
}

const DivStyled = styled.div<DivProp>`
  ${props => (props.active && props.active ? 'background-color: #d0e5e9;' : '')}
`

class MenuStep extends Component<Props, State> {
  public state: State = {
    steps: [
      {
        type: StepType.ONE,
        name: 'Step One',
        value: 1,
      },
      {
        type: StepType.TWO,
        name: 'Step Two',
        value: 2,
      },
      {
        type: StepType.THREE,
        name: 'Step Tree',
        value: 3,
      },
      {
        type: StepType.FOUR,
        name: 'Step Four',
        value: 4,
      },
    ],
  }

  public render() {
    const { steps } = this.state
    const currentStepItemSelected = steps.find(step => step.type === this.props.currentStep)

    const stepsBlocks = steps.map((step, index) => (
      <DivStyled
        active={currentStepItemSelected && step.value <= currentStepItemSelected.value}
        key={index}
      >
        {step.name}
      </DivStyled>
    ))
    const stepsBlocksPosition = `Step ${currentStepItemSelected &&
      currentStepItemSelected.value} of ${steps.length}`

    return (
      <>
        {stepsBlocksPosition}
        {stepsBlocks}
      </>
    )
  }
}

export { MenuStep }
