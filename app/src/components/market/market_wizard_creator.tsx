import React, { ChangeEvent, Component } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import {
  AskQuestionStep,
  FundingAndFeeStep,
  OutcomesStep,
  CreateMarketStep,
  MenuStep,
  SummaryMarketStep,
} from './steps'

import { StatusMarketCreation } from '../../util/types'
import { BigNumberInputReturn } from '../common/big_number_input'

export interface MarketData {
  collateralId: KnownToken
  question: string
  category: string
  resolution: Date | null
  arbitratorId: KnownArbitrator
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
      collateralId: 'dai',
      question: '',
      category: '',
      resolution: null,
      arbitratorId: 'realitio',
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

    // when the collateral changes, reset the value of funding
    const funding: BigNumber =
      name === 'collateralId' ? ethers.constants.Zero : this.state.marketData.funding

    this.setState((prevState: State) => ({
      ...prevState,
      marketData: {
        ...prevState.marketData,
        funding,
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
      collateralId,
      question,
      category,
      resolution,
      arbitratorId,
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
            handleChange={this.handleChange}
            handleChangeDate={this.handleChangeDate}
            next={() => this.next()}
            values={{ question, category, resolution, arbitratorId }}
          />
        )
      case 2:
        return (
          <FundingAndFeeStep
            back={() => this.back()}
            handleChange={this.handleChange}
            next={() => this.next()}
            values={{ collateralId, spread, funding }}
          />
        )
      case 3:
        return (
          <OutcomesStep
            back={() => this.back()}
            next={() => this.next()}
            values={{
              outcomeProbabilityOne,
              outcomeProbabilityTwo,
              outcomeValueOne,
              outcomeValueTwo,
              question,
            }}
            handleChange={this.handleChange}
          />
        )
      case 4:
        return (
          <CreateMarketStep
            back={() => this.back()}
            marketMakerAddress={marketMakerAddress}
            questionId={questionId}
            status={status}
            submit={() => this.submit()}
            values={{ ...marketData }}
          />
        )
      default:
        return (
          <AskQuestionStep
            handleChange={this.handleChange}
            handleChangeDate={this.handleChangeDate}
            next={() => this.next()}
            values={{ question, category, resolution, arbitratorId }}
          />
        )
    }
  }

  public currentMenu = () => {
    const { currentStep } = this.state
    return <MenuStep currentStep={currentStep} />
  }

  public summaryMarketStep = () => {
    const { marketMakerAddress } = this.props

    return marketMakerAddress ? <SummaryMarketStep marketMakerAddress={marketMakerAddress} /> : ''
  }

  render() {
    const { status } = this.props
    return (
      <>
        {status !== StatusMarketCreation.Done && (
          <>
            {this.currentMenu()} {this.currentStep()}
          </>
        )}
        {status === StatusMarketCreation.Done && this.summaryMarketStep()}
      </>
    )
  }
}
