import React, { Component, ChangeEvent } from 'react'

import {
  StepType,
  StepsMachine,
  AskQuestionStep,
  FundingAndFeeStep,
  OutcomesStep,
  SummaryStep,
  MenuStep,
} from './steps'

interface MarketData {
  question: string
  category: string
  resolution: Date | null
  spread: string
  funding: string
  outcomeValueOne: string
  outcomeValueTwo: string
  outcomeProbabilityOne: string
  outcomeProbabilityTwo: string
}

interface Props {
  callback: (param: MarketData) => void
}

interface State {
  currentStep: StepType
  stepsMachine: StepsMachine
  marketData: MarketData
}

class MarketWizardCreator extends Component<Props, State> {
  public state: State = {
    currentStep: StepType.ONE,
    stepsMachine: new StepsMachine(),
    marketData: {
      question: '',
      category: '',
      resolution: null,
      spread: '',
      funding: '',
      outcomeValueOne: '',
      outcomeValueTwo: '',
      outcomeProbabilityOne: '',
      outcomeProbabilityTwo: '',
    },
  }

  public next = (desiredStep: StepType): void => {
    const { currentStep, stepsMachine } = this.state
    const nextStep: StepType = stepsMachine.transitionTo(currentStep, desiredStep)
    this.setState({
      currentStep: nextStep,
    })
  }

  public back = (desiredStep: StepType): void => {
    const { currentStep, stepsMachine } = this.state
    const nextStep: StepType = stepsMachine.transitionFrom(currentStep, desiredStep)
    this.setState({
      currentStep: nextStep,
    })
  }

  public handleChange = (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target

    this.setState((prevState: State) => ({
      ...prevState,
      marketData: {
        ...prevState.marketData,
        [name]: value,
      },
    }))
  }

  public handleChangeDate = (date: Date | null) => {
    this.setState((prevState: State) => ({
      ...prevState,
      marketData: {
        ...prevState.marketData,
        resolution: date,
      },
    }))
  }

  public submit = () => {
    const { callback } = this.props

    callback({ ...this.state.marketData })
  }

  public currentStep = () => {
    const { currentStep, marketData } = this.state

    const {
      question,
      category,
      resolution,
      spread,
      funding,
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    } = marketData

    switch (currentStep) {
      case StepType.ONE:
        return (
          <AskQuestionStep
            next={() => this.next(StepType.TWO)}
            values={{ question, category, resolution }}
            handleChange={this.handleChange}
            handleChangeDate={this.handleChangeDate}
          />
        )
      case StepType.TWO:
        return (
          <FundingAndFeeStep
            next={() => this.next(StepType.THREE)}
            back={() => this.back(StepType.ONE)}
            values={{ spread, funding }}
            handleChange={this.handleChange}
          />
        )
      case StepType.THREE:
        return (
          <OutcomesStep
            next={() => this.next(StepType.FOUR)}
            back={() => this.back(StepType.TWO)}
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
      case StepType.FOUR:
        return (
          <SummaryStep
            back={() => this.back(StepType.THREE)}
            submit={() => this.submit()}
            values={{ ...marketData }}
          />
        )
      default:
        return (
          <AskQuestionStep
            next={() => this.next(StepType.TWO)}
            values={{ question, category, resolution }}
            handleChange={this.handleChange}
            handleChangeDate={this.handleChangeDate}
          />
        )
    }
  }

  public currentMenu = () => {
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
