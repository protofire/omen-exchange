import React, { Component } from 'react'
import styled from 'styled-components'

import { SectionTitle } from '../../../../common'

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

const CreateTitle = styled(SectionTitle)`
  margin-bottom: 28px;

  .titleText {
    color: #263238;
    font-size: 20px;
  }
`

const StepsWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto 32px;
  max-width: 100%;
  width: 400px;
`

const Step = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right: 20px;

  &:last-child {
    margin-right: 0;
  }
`

const StepBar = styled.div<{ active?: boolean }>`
  background-color: ${props => (props.active ? props.theme.colors.primary : '#F5F5F5')};
  border-radius: 5px;
  height: 5px;
  margin-bottom: 16px;
  width: 100%;
`

const StepName = styled.div<{ active?: boolean }>`
  color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.textColor)};
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.4px;
  line-height: 1.2;
  white-space: nowrap;
`

class MenuStep extends Component<Props, State> {
  public state: State = {
    steps: [
      {
        name: 'Configure Market',
        value: 1,
      },
      {
        name: 'Fund Market',
        value: 2,
      },
    ],
  }

  public render() {
    const { steps } = this.state
    const currentStepItemSelected = steps.find(step => step.value === this.props.currentStep)

    const stepsBlocks = steps.map((step, index) => {
      const active = currentStepItemSelected && step.value === currentStepItemSelected.value

      return (
        <Step key={index}>
          <StepBar active={active} />
          <StepName active={active}>{step.name}</StepName>
        </Step>
      )
    })

    return (
      <>
        <CreateTitle title={'Create Market'} />
        <StepsWrapper>{stepsBlocks}</StepsWrapper>
      </>
    )
  }
}

export { MenuStep }
