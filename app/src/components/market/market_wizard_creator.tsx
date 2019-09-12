import React, { Component, ChangeEvent } from 'react'

import {
  StepTypes,
  StepsMachine,
  FirstStep,
  SecondStep,
  ThirdStep,
  FourthStep,
  MenuStep,
} from './steps'

interface Values {
  question: string
  category: string
  resolution: Date | null
  spreed: string
  funding: string
  outcomeValueOne: string
  outcomeValueTwo: string
  outcomeProbabilityOne: string
  outcomeProbabilityTwo: string
}

interface Props {
  callback: (param: Values) => void
}

interface Steps {
  currentStep: StepTypes
  stepsMachine: StepsMachine
}

type State = Values & Steps

class MarketWizardCreator extends Component<Props, State> {
  public state: State = {
    currentStep: StepTypes.ONE,
    stepsMachine: new StepsMachine(),
    question: '',
    category: '',
    resolution: null,
    spreed: '',
    funding: '',
    outcomeValueOne: '',
    outcomeValueTwo: '',
    outcomeProbabilityOne: '',
    outcomeProbabilityTwo: '',
  }

  constructor(props: Props) {
    super(props)
    this.next = this.next.bind(this)
    this.back = this.back.bind(this)
    this.submit = this.submit.bind(this)
  }

  public next(desiredStep: StepTypes) {
    const { currentStep, stepsMachine } = this.state
    const nextStep: StepTypes = stepsMachine.transitionTo(currentStep, desiredStep)
    this.setState({
      currentStep: nextStep,
    })
  }

  public back(desiredStep: StepTypes) {
    const { currentStep, stepsMachine } = this.state
    const nextStep: StepTypes = stepsMachine.transitionFrom(currentStep, desiredStep)
    this.setState({
      currentStep: nextStep,
    })
  }

  public handleChange = (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target

    const state = ({
      [name]: value,
    } as unknown) as State

    this.setState(state)
  }

  public handleChangeDate = (date: Date | null) => {
    this.setState({
      resolution: date,
    })
  }

  public submit() {
    const { callback } = this.props
    const {
      question,
      category,
      resolution,
      spreed,
      funding,
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    } = this.state

    callback({
      question,
      category,
      resolution,
      spreed,
      funding,
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    })
  }

  public currentStep() {
    const {
      currentStep,
      question,
      category,
      resolution,
      spreed,
      funding,
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    } = this.state

    switch (currentStep) {
      case StepTypes.ONE:
        return (
          <FirstStep
            next={() => this.next(StepTypes.TWO)}
            values={{ question, category, resolution }}
            handleChange={this.handleChange}
            handleChangeDate={this.handleChangeDate}
          />
        )
      case StepTypes.TWO:
        return (
          <SecondStep
            next={() => this.next(StepTypes.THREE)}
            back={() => this.back(StepTypes.ONE)}
            values={{ spreed, funding }}
            handleChange={this.handleChange}
          />
        )
      case StepTypes.THREE:
        return (
          <ThirdStep
            next={() => this.next(StepTypes.FOUR)}
            back={() => this.back(StepTypes.TWO)}
            values={{
              question,
              outcomeValueOne,
              outcomeValueTwo,
              outcomeProbabilityOne,
              outcomeProbabilityTwo,
            }}
            handleChange={this.handleChange}
          />
        )
      case StepTypes.FOUR:
        return (
          <FourthStep
            back={() => this.back(StepTypes.THREE)}
            submit={() => this.submit()}
            values={{
              question,
              category,
              resolution,
              spreed,
              funding,
              outcomeValueOne,
              outcomeValueTwo,
              outcomeProbabilityOne,
              outcomeProbabilityTwo,
            }}
          />
        )
      default:
        return (
          <FirstStep
            next={() => this.next(StepTypes.TWO)}
            values={{ question, category, resolution }}
            handleChange={this.handleChange}
            handleChangeDate={this.handleChangeDate}
          />
        )
    }
  }

  public currentMenu() {
    const { currentStep } = this.state
    return <MenuStep currentStep={currentStep} />
  }

  render() {
    return (
      <>
        <div>{this.currentMenu()}</div>
        <div>{this.currentStep()}</div>
      </>
    )
  }
}

export { MarketWizardCreator }
