import React, { Component } from 'react'
import styled from 'styled-components'

import { SectionTitle } from '../../common'

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
  max-width: 100%;
  width: ${props => props.theme.mainContainer.maxWidth};
`

const CreateTitle = styled(SectionTitle)`
  margin-bottom: 28px;
  .titleText {
    color: #263238;
    font-size: 20px;
  }
`

const Step = styled.div<{ active?: boolean }>`
  background-color: ${props => (props.active ? props.theme.colors.secondary : '#ddd')};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 6px;
  margin-right: 30px;
  width: 100%;
  border-radius: 6px;

  &:last-child {
    margin-right: 0;
  }
`

const StepName = styled.div<{ active?: boolean }>`
  color: ${props => (props.active ? props.theme.colors.secondary : '#ddd')};
  margin-top: 6px;
  font-size: 12px;
  line-height: 19px;
  letter-spacing: 0.4px;
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
      const active = currentStepItemSelected && step.value <= currentStepItemSelected.value
      return (
        <Step active={active} key={index}>
          <StepName active={active}>{step.name}</StepName>
        </Step>
      )
    })

    return (
      <>
        <CreateTitle title={'Create Market'} />
        <Wrapper>{stepsBlocks}</Wrapper>
      </>
    )
  }
}

export { MenuStep }
