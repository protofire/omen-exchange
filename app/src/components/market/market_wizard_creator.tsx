import React, { ChangeEvent, Component } from 'react'
import { BigNumber } from 'ethers/utils'

import {
  AskQuestionStep,
  FundingAndFeeStep,
  OutcomesStep,
  CreateMarketStep,
  MenuStep,
  ResumeMarketStep,
} from './steps'

import { StatusMarketCreation } from '../../util/types'
import { BigNumberInputReturn } from '../common/big_number_input'

export interface MarketData {
  question: string
  category: string
  resolution: Date | null
  spread: string
  funding: BigNumber
  outcomeValueOne: string
  outcomeValueTwo: string
  outcomeProbabilityOne: string
  outcomeProbabilityTwo: string
}

interface Props {
  callback: (param: MarketData) => void
  status: StatusMarketCreation
  questionId: string | null
  marketMakerAddress: string | null
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
      spread: '1',
      funding: new BigNumber('0'),
      outcomeValueOne: 'Yes',
      outcomeValueTwo: 'No',
      outcomeProbabilityOne: '50',
      outcomeProbabilityTwo: '50',
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

  public handleChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | BigNumberInputReturn,
  ) => {
    const { name, value } = 'target' in event ? event.target : event

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
    const { marketMakerAddress, status, questionId } = this.props

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
          <CreateMarketStep
            back={() => this.back()}
            submit={() => this.submit()}
            values={{ ...marketData }}
            status={status}
            questionId={questionId}
            marketMakerAddress={marketMakerAddress}
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

  public resumeMarketStep = () => {
    const { marketData } = this.state
    const { marketMakerAddress } = this.props

    return <ResumeMarketStep values={{ ...marketData }} marketMakerAddress={marketMakerAddress} />
  }

  render() {
    const { status } = this.props
    return (
      <div className="row">
        <div className="col-2" />
        <div className="col-6">
          {status !== StatusMarketCreation.Done && (
            <>
              {this.currentMenu()} {this.currentStep()}
            </>
          )}
          {status === StatusMarketCreation.Done && this.resumeMarketStep()}
        </div>
        <div className="col-2" />
      </div>
    )
  }
}
