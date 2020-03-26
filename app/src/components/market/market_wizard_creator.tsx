import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { MARKET_FEE } from '../../common/constants'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { MarketCreationStatus } from '../../util/market_creation_status_data'
import { getArbitrator, getDefaultArbitrator, getDefaultToken, getToken } from '../../util/networks'
import { Arbitrator, MarketData, Question, Token } from '../../util/types'
import { BigNumberInputReturn } from '../common/big_number_input'

import { Outcome } from './outcomes'
import { AskQuestionStep, FundingAndFeeStep, MenuStep, SummaryMarketStep } from './steps'

interface Props {
  callback: (param: MarketData) => void
  marketCreationStatus: MarketCreationStatus
  marketMakerAddress: string | null
}

export const MarketWizardCreator = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const { callback, marketCreationStatus, marketMakerAddress } = props

  const defaultCollateral = getDefaultToken(networkId)
  const defaultArbitrator = getDefaultArbitrator(networkId)

  const marketDataDefault: MarketData = {
    collateral: defaultCollateral,
    arbitratorsCustom: [],
    categoriesCustom: [],
    question: '',
    category: '',
    resolution: null,
    arbitrator: defaultArbitrator,
    spread: MARKET_FEE,
    funding: new BigNumber('0'),
    // I'll comment this out for now, new design shows no outcomes by default
    // outcomes: [
    //   {
    //     name: 'Yes',
    //     probability: 50,
    //   },
    //   {
    //     name: 'No',
    //     probability: 50,
    //   },
    // ],
    outcomes: [],
    loadedQuestionId: null,
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [marketData, setMarketdata] = useState<MarketData>(marketDataDefault)

  useEffect(() => {
    let isSubscribed = true

    const updateMarketData = async () => {
      const collateral = getToken(networkId, marketData.collateral.symbol.toLowerCase() as KnownToken)

      const arbitrator = getArbitrator(networkId, marketData.arbitrator.id)

      const newMarketData = {
        ...marketData,
        collateral,
        arbitrator,
      }

      if (isSubscribed) {
        setMarketdata(newMarketData)
      }
    }

    updateMarketData()

    return () => {
      isSubscribed = false
    }
    /* NOTE: The linter want us to add marketData to the dependency array, but it
    creates a sort of infinite loop, so I'm not gonna do it for now */
    // eslint-disable-next-line
  }, [networkId])

  const next = (): void => {
    const actualCurrentStep = currentStep >= 3 ? 4 : currentStep + 1
    setCurrentStep(actualCurrentStep)
  }

  const back = (): void => {
    const actualCurrentStep = currentStep <= 1 ? 1 : currentStep - 1
    setCurrentStep(actualCurrentStep)
  }

  const addArbitratorCustom = (arbitrator: Arbitrator): void => {
    const arbitratorsCustom = marketData.arbitratorsCustom
    arbitratorsCustom.push(arbitrator)
    const newMarketData = {
      ...marketData,
      arbitratorsCustom,
    }
    setMarketdata(newMarketData)
  }

  const addCategoryCustom = (category: string): void => {
    const categoriesCustom = marketData.categoriesCustom
    categoriesCustom.push(category)
    const newMarketData = {
      ...marketData,
      categoriesCustom,
    }
    setMarketdata(newMarketData)
  }

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | BigNumberInputReturn
      | ChangeEvent<HTMLButtonElement>,
  ) => {
    const { name, value } = 'target' in event ? event.target : event

    console.warn(`Name: ${name} - Value: ${value}`)

    const newMarketData = {
      ...marketData,
      [name]: value,
    }
    setMarketdata(newMarketData)
  }

  const handleArbitratorChange = (arbitrator: Arbitrator) => {
    const newMarketData = {
      ...marketData,
      arbitrator,
    }
    setMarketdata(newMarketData)
  }

  const handleQuestionChange = (questionObj: Question, arbitrator: Arbitrator) => {
    const { category, outcomes, question, questionId, resolution } = questionObj

    const outcomesFromQuestion = outcomes.map(outcomeName => {
      return {
        name: outcomeName,
        probability: outcomes.length > 0 ? 100 / outcomes.length : 100,
      }
    })

    const newMarketData = {
      ...marketData,
      arbitrator,
      question,
      category,
      resolution,
      outcomes: outcomesFromQuestion,
      loadedQuestionId: questionId,
    }

    setMarketdata(newMarketData)
  }

  const handleCollateralChange = (collateral: Token) => {
    const newMarketData = {
      ...marketData,
      funding: ethers.constants.Zero, // when the collateral changes, reset the value of funding
      collateral,
    }
    setMarketdata(newMarketData)
  }

  const handleClearQuestion = () => {
    const newMarketData = {
      ...marketData,
      question: '',
      category: '',
      resolution: null,
      arbitrator: defaultArbitrator,
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
      loadedQuestionId: null,
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

  const handleDateChange = (date: Date | null) => {
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
      arbitrator,
      arbitratorsCustom,
      categoriesCustom,
      category,
      loadedQuestionId,
      outcomes,
      question,
      resolution,
    } = marketData

    switch (currentStep) {
      case 1:
        return (
          <AskQuestionStep
            addArbitratorCustom={addArbitratorCustom}
            addCategoryCustom={addCategoryCustom}
            handleArbitratorChange={handleArbitratorChange}
            handleChange={handleChange}
            handleClearQuestion={handleClearQuestion}
            handleDateChange={handleDateChange}
            handleOutcomesChange={handleOutcomesChange}
            handleQuestionChange={handleQuestionChange}
            next={() => next()}
            values={{
              question,
              outcomes,
              loadedQuestionId,
              category,
              categoriesCustom,
              resolution,
              arbitrator,
              arbitratorsCustom,
            }}
          />
        )
      case 2:
        return (
          <FundingAndFeeStep
            back={() => back()}
            handleChange={handleChange}
            handleCollateralChange={handleCollateralChange}
            marketCreationStatus={marketCreationStatus}
            submit={() => submit()}
            values={marketData}
          />
        )

      default:
        return (
          <AskQuestionStep
            addArbitratorCustom={addArbitratorCustom}
            addCategoryCustom={addCategoryCustom}
            handleArbitratorChange={handleArbitratorChange}
            handleChange={handleChange}
            handleClearQuestion={handleClearQuestion}
            handleDateChange={handleDateChange}
            handleOutcomesChange={handleOutcomesChange}
            handleQuestionChange={handleQuestionChange}
            next={() => next()}
            values={{
              question,
              outcomes,
              loadedQuestionId,
              category,
              categoriesCustom,
              resolution,
              arbitrator,
              arbitratorsCustom,
            }}
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
      {!MarketCreationStatus.is.done(marketCreationStatus) && (
        <>
          {currentMenu()} {currentStepFn()}
        </>
      )}
      {MarketCreationStatus.is.done(marketCreationStatus) && summaryMarketStep()}
    </>
  )
}
