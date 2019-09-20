import React, { Component } from 'react'
import styled from 'styled-components'

interface Props {
  currentStep: number
}

interface State {
  steps: StepItem[]
}

interface StepItem {
  name: string
  value: number
}

interface DivProp {
  active?: boolean
  key?: number
}

const DivStep = styled.div<DivProp>`
  ${props => (props.active ? 'background-color: #050300;' : 'background-color: #D8D6D3')}
  height: 23px;
  width: 100%;
`

class MenuStep extends Component<Props, State> {
  public state: State = {
    steps: [
      {
        name: 'Step One',
        value: 1,
      },
      {
        name: 'Step Two',
        value: 2,
      },
      {
        name: 'Step Tree',
        value: 3,
      },
      {
        name: 'Step Four',
        value: 4,
      },
    ],
  }

  public render() {
    const { steps } = this.state
    const currentStepItemSelected = steps.find(step => step.value === this.props.currentStep)

    const stepsBlocks = steps.map((step, index) => (
      <DivStep
        active={currentStepItemSelected && step.value <= currentStepItemSelected.value}
        key={index}
        className="col center"
      ></DivStep>
    ))
    const stepsBlocksPosition = `Step ${currentStepItemSelected &&
      currentStepItemSelected.value} of ${steps.length}`

    return (
      <>
        <div className="row right">{stepsBlocksPosition}</div>
        <div className="row">{stepsBlocks}</div>
      </>
    )
  }
}

export { MenuStep }
