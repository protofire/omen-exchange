import { useQuery } from '@apollo/react-hooks'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { MARKET_FEE } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { queryTopCategories } from '../../../../queries/markets_home'
import { MarketCreationStatus } from '../../../../util/market_creation_status_data'
import { getArbitrator, getDefaultArbitrator, getDefaultToken, getToken } from '../../../../util/networks'´
import { Arbitrator, GraphResponseTopCategories, MarketData, Question, Token } from '../../../../util/types'
import { limitDecimalPlaces } from '../../../../util/tools'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'

import { AskQuestionStep, FundingAndFeeStep, MenuStep } from './steps'
import { Outcome } from './steps/outcomes'

interface Props {
  callback: (param: MarketData) => void
  marketCreationStatus: MarketCreationStatus
  marketMakerAddress: string | null
}

export const MarketWizardCreator = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const { callback, marketCreationStatus } = props

  const defaultCollateral = getDefaultToken(networkId)
  const defaultArbitrator = getDefaultArbitrator(networkId)

  const marketDataDefault: MarketData = {
    arbitrator: defaultArbitrator,
    arbitratorsCustom: [],
    categoriesCustom: [],
    category: '',
    collateral: defaultCollateral,
    funding: new BigNumber('0'),
    loadedQuestionId: null,
    outcomes: [],
    question: '',
    resolution: null,
    spread: MARKET_FEE,
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [marketData, setMarketdata] = useState<MarketData>(marketDataDefault)
  const [first, setFirst] = useState<number>(8)
  const [loadMoreButton, setLoadMoreButton] = useState<boolean>(true)

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

  const { data: topCategories } = useQuery<GraphResponseTopCategories>(queryTopCategories, {
    notifyOnNetworkStatusChange: true,
    variables: { first },
  })

  useEffect(() => {
    if (topCategories) {
      const categoriesCustom: string[] = topCategories.categories.map(category => category.id)

      const newMarketData = {
        ...marketData,
        categoriesCustom,
      }

      setMarketdata(newMarketData)

      setLoadMoreButton(first <= categoriesCustom.length)
    }
    /* NOTE: The linter want us to add marketData to the dependency array, but it
    creates a sort of infinite loop, so I'm not gonna do it for now */
    // eslint-disable-next-line
  }, [topCategories])

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

    const newMarketData = {
      ...marketData,
      [name]:
        name === 'category'
          ? (value as string).toLowerCase()
          : name === 'spread'
          ? limitDecimalPlaces(value as string, 2)
          : value,
    }
    setMarketdata(newMarketData)
  }

  const resetTradingFee = () => {
    const newMarketData = {
      ...marketData,
      spread: MARKET_FEE,
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
    const { category, id: questionId, outcomes, resolution, title: question } = questionObj

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
      outcomes: [],
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
      case 2:
        return (
          <FundingAndFeeStep
            back={() => back()}
            handleChange={handleChange}
            handleCollateralChange={handleCollateralChange}
            marketCreationStatus={marketCreationStatus}
            resetTradingFee={resetTradingFee}
            submit={() => submit()}
            values={marketData}
          />
        )
      case 1:
      default:
        return (
          <AskQuestionStep
            addArbitratorCustom={addArbitratorCustom}
            addCategoryCustom={addCategoryCustom}
            first={first}
            handleArbitratorChange={handleArbitratorChange}
            handleChange={handleChange}
            handleClearQuestion={handleClearQuestion}
            handleDateChange={handleDateChange}
            handleOutcomesChange={handleOutcomesChange}
            handleQuestionChange={handleQuestionChange}
            loadMoreButton={loadMoreButton}
            next={() => next()}
            setFirst={setFirst}
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

  return (
    <>
      {!MarketCreationStatus.is.done(marketCreationStatus) && (
        <>
          {currentMenu()} {currentStepFn()}
        </>
      )}
    </>
  )
}
