import React, { ChangeEvent, useEffect, useState } from 'react'
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

import { Token } from '../../util/types'
import { MARKET_FEE } from '../../common/constants'
import { BigNumberInputReturn } from '../common/big_number_input'
import { Outcome } from '../common/outcomes'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { getDefaultToken, getToken } from '../../util/networks'
import { MarketCreationStatus } from '../../util/market_creation_status_data'

export interface MarketData {
  collateral: Token
  collateralsCustom: Token[]
  question: string
  category: string
  resolution: Date | null
  arbitratorId: KnownArbitrator
  spread: number
  funding: BigNumber
  outcomes: Outcome[]
}

interface Props {
  callback: (param: MarketData) => void
  marketCreationStatus: MarketCreationStatus
  questionId: string | null
  marketMakerAddress: string | null
}

interface State {
  currentStep: number
  marketData: MarketData
}

export const MarketWizardCreator = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const { callback, marketCreationStatus, questionId, marketMakerAddress } = props

  const defaultCollateral = getDefaultToken(networkId)

  const marketDataDefault: MarketData = {
    collateral: defaultCollateral,
    collateralsCustom: [],
    question: '',
    category: '',
    resolution: null,
    arbitratorId: 'realitio',
    spread: MARKET_FEE,
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

  useEffect(() => {
    let isSubscribed = true

    const fetchNewCollateral = async () => {
      const collateral = getToken(
        networkId,
        marketData.collateral.symbol.toLowerCase() as KnownToken,
      )
      const newMarketData = {
        ...marketData,
        collateral: collateral,
      }

      if (isSubscribed) {
        setMarketdata(newMarketData)
      }
    }

    fetchNewCollateral()

    return () => {
      isSubscribed = false
    }
  }, [networkId])

  const next = (): void => {
    const actualCurrentStep = currentStep >= 3 ? 4 : currentStep + 1
    setCurrentStep(actualCurrentStep)
  }

  const back = (): void => {
    const actualCurrentStep = currentStep <= 1 ? 1 : currentStep - 1
    setCurrentStep(actualCurrentStep)
  }

  const addCollateralCustom = (collateral: Token): void => {
    const collateralsCustom = marketData.collateralsCustom
    collateralsCustom.push(collateral)
    const newMarketData = {
      ...marketData,
      collateralsCustom,
    }
    setMarketdata(newMarketData)
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | BigNumberInputReturn,
  ) => {
    const { name, value } = 'target' in event ? event.target : event

    const newMarketData = {
      ...marketData,
      [name]: value,
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
      collateral,
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
            handleCollateralChange={handleCollateralChange}
            addCollateralCustom={addCollateralCustom}
            next={() => next()}
            values={{ collateral, collateralsCustom, spread, funding }}
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
            marketCreationStatus={marketCreationStatus}
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
      {!MarketCreationStatus.is.done(marketCreationStatus) && (
        <>
          {currentMenu()} {currentStepFn()}
        </>
      )}
      {MarketCreationStatus.is.done(marketCreationStatus) && summaryMarketStep()}
    </>
  )
}
