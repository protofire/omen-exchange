import React, { Component, ChangeEvent } from 'react'

import { AskQuestionStep, FundingAndFeeStep, OutcomesStep, SummaryStep, MenuStep } from './steps'

export interface MarketData {
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
  status: string
}

interface State {
  currentStep: number
  marketData: MarketData
}

export class MarketWizardCreator extends Component<Props, State> {
  public state: State = {
    currentStep: 1,
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

  public next = (): void => {
    let { currentStep } = this.state
    currentStep = currentStep >= 3 ? 4 : currentStep + 1
    this.setState({
      currentStep,
    })
  }

  public back = (): void => {
    let { currentStep } = this.state
    currentStep = currentStep <= 1 ? 1 : currentStep - 1
    this.setState({
      currentStep,
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
      case 1:
        return (
          <AskQuestionStep
            next={() => this.next()}
            values={{ question, category, resolution }}
            handleChange={this.handleChange}
            handleChangeDate={this.handleChangeDate}
          />
        )
      case 2:
        return (
          <FundingAndFeeStep
            next={() => this.next()}
            back={() => this.back()}
            values={{ spread, funding }}
            handleChange={this.handleChange}
          />
        )
      case 3:
        return (
          <OutcomesStep
            next={() => this.next()}
            back={() => this.back()}
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
      case 4:
        return (
          <SummaryStep
            back={() => this.back()}
            submit={() => this.submit()}
            values={{ ...marketData }}
            status={this.props.status}
          />
        )
      default:
        return (
          <AskQuestionStep
            next={() => this.next()}
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
