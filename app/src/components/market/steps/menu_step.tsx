import React, { Component } from 'react'
import styled from 'styled-components'
import { SectionTitle } from '../../common/section_title'

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

const Wrapper = styled.div`
  display: flex;
  margin: 0 auto 20px;
  max-width: ${props => props.theme.createSteps.maxWidth};
  width: 100%;
`

const Step = styled.div<{ active?: boolean }>`
  background-color: ${props => (props.active ? props.theme.colors.secondary : '#ddd')};
  height: 6px;
  margin-right: 30px;
  width: 100%;
  border-radius: 6px;

  &:last-child {
    margin-right: 0;
  }
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
      <Step
        active={currentStepItemSelected && step.value <= currentStepItemSelected.value}
        key={index}
      ></Step>
    ))

    return (
      <>
        <SectionTitle title={'Conditional Exchange'} subTitle={'Create A New Market'} />
        <Wrapper>{stepsBlocks}</Wrapper>
      </>
    )
  }
}

export { MenuStep }
