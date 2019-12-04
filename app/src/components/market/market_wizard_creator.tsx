import React, { ChangeEvent, useState } from 'react'
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

import { Collateral, CollateralCustomEvent, StatusMarketCreation } from '../../util/types'
import { BigNumberInputReturn } from '../common/big_number_input'
import { Outcome } from '../common/outcomes'

export interface MarketData {
  collateralId: KnownToken
  collateralsCustom: Collateral[]
  question: string
  category: string
  resolution: Date | null
  arbitratorId: KnownArbitrator
  spread: string
  funding: BigNumber
  outcomes: Outcome[]
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

export const MarketWizardCreator = (props: Props) => {
  const { callback, status, questionId, marketMakerAddress } = props

  const marketDataDefault: MarketData = {
    collateralId: 'dai',
    collateralsCustom: [],
    question: '',
    category: '',
    resolution: null,
    arbitratorId: 'realitio',
    spread: '1',
    funding: new BigNumber('0'),
    outcomes: [
      {
        name: 'Yes',
        probability: 50,
      },
      {
        name: 'No',
        probability: 50,
      },
    ],
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [marketData, setMarketdata] = useState<MarketData>(marketDataDefault)

  const next = (): void => {
    const actualCurrentStep = currentStep >= 3 ? 4 : currentStep + 1
    setCurrentStep(actualCurrentStep)
  }

  const back = (): void => {
    const actualCurrentStep = currentStep <= 1 ? 1 : currentStep - 1
    setCurrentStep(actualCurrentStep)
  }

  const addCollateralCustom = (collateral: Collateral): void => {
    const collateralsCustom = marketData.collateralsCustom
    collateralsCustom.push(collateral)
    const newMarketData = {
      ...marketData,
      collateralsCustom,
    }
    setMarketdata(newMarketData)
  }

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | BigNumberInputReturn
      | CollateralCustomEvent,
  ) => {
    const { name, value } = 'target' in event ? event.target : event

    // when the collateral changes, reset the value of funding
    const funding: BigNumber = name === 'collateralId' ? ethers.constants.Zero : marketData.funding

    const newMarketData = {
      ...marketData,
      funding,
      [name]: value,
    }
    setMarketdata(newMarketData)
  }

  const handleOutcomesChange = (outcomes: Outcome[]) => {
    const newMarketData = {
      ...marketData,
      outcomes,
    }
    setMarketdata(newMarketData)
  }

  const handleChangeDate = (date: Date | null) => {
    const newMarketData = {
      ...marketData,
      resolution: date,
    }
    setMarketdata(newMarketData)
  }

  const submit = () => {
    callback(marketData as MarketData)
  }

  const currentStepFn = () => {
    const {
      collateralId,
      collateralsCustom,
      question,
      category,
      resolution,
      arbitratorId,
      spread,
      funding,
      outcomes,
    } = marketData

    switch (currentStep) {
      case 1:
        return (
          <AskQuestionStep
            handleChange={handleChange}
            handleChangeDate={handleChangeDate}
            next={() => next()}
            values={{ question, category, resolution, arbitratorId }}
          />
        )
      case 2:
        return (
          <FundingAndFeeStep
            back={() => back()}
            handleChange={handleChange}
            addCollateralCustom={addCollateralCustom}
            next={() => next()}
            values={{ collateralId, collateralsCustom, spread, funding }}
          />
        )
      case 3:
        return (
          <OutcomesStep
            back={() => back()}
            next={() => next()}
            values={{
              outcomes,
              question,
            }}
            handleOutcomesChange={handleOutcomesChange}
          />
        )
      case 4:
        return (
          <CreateMarketStep
            back={() => back()}
            marketMakerAddress={marketMakerAddress}
            questionId={questionId}
            status={status}
            submit={() => submit()}
            values={marketData}
          />
        )
      default:
        return (
          <AskQuestionStep
            handleChange={handleChange}
            handleChangeDate={handleChangeDate}
            next={() => next()}
            values={{ question, category, resolution, arbitratorId }}
          />
        )
    }
  }

  const currentMenu = () => {
    return <MenuStep currentStep={currentStep} />
  }

  const summaryMarketStep = () => {
    return marketMakerAddress ? <SummaryMarketStep marketMakerAddress={marketMakerAddress} /> : ''
  }

  return (
    <>
      {status !== StatusMarketCreation.Done && (
        <>
          {currentMenu()} {currentStepFn()}
        </>
      )}
      {status === StatusMarketCreation.Done && summaryMarketStep()}
    </>
  )
}
