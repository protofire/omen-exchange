import React, { FC, useState } from 'react'
import { BigNumber } from 'ethers/utils'

import { Status, BalanceItems } from '../../util/types'
import { Buy } from './profile/buy'
import { Sell } from './profile/sell'
import { View } from './profile/view'
import { QuestionHeader } from './profile/question_header'

interface Props {
  balance: BalanceItems[]
  funding: BigNumber
  question: string
  resolution: Date
  status: Status
  marketAddress: string
}

enum Step {
  View = 'View',
  Buy = 'Buy',
  Sell = 'Sell',
}

const MarketView: FC<Props> = props => {
  const { funding, question, resolution, balance, marketAddress } = props
  const [currentStep, setCurrentStep] = useState<Step>(Step.View)

  const handleFinish = (): void => {
    setCurrentStep(Step.View)
  }

  const handleBack = (): void => {
    setCurrentStep(Step.View)
  }

  const handleBuy = (): void => {
    setCurrentStep(Step.Buy)
  }

  const handleSell = (): void => {
    setCurrentStep(Step.Sell)
  }

  const renderView = () => {
    switch (currentStep) {
      case Step.View:
        return (
          <>
            <View handleBuy={() => handleBuy()} handleSell={() => handleSell()} {...props} />
          </>
        )
      case Step.Buy:
        return (
          <>
            <Buy
              handleBack={() => handleBack()}
              handleFinish={() => handleFinish()}
              balance={balance}
              marketAddress={marketAddress}
              funding={funding}
            />
          </>
        )
      case Step.Sell:
        return (
          <>
            <Sell
              handleBack={() => handleBack()}
              handleFinish={() => handleFinish()}
              balance={balance}
              marketAddress={marketAddress}
              funding={funding}
            />
          </>
        )
      default:
        return (
          <>
            <View handleBuy={() => handleBuy()} handleSell={() => handleSell()} {...props} />
          </>
        )
    }
  }

  return (
    <div className="row">
      <div className="col-2" />
      <div className="col-6">
        <QuestionHeader question={question} resolution={resolution} />
        {renderView()}
      </div>
      <div className="col-2" />
    </div>
  )
}

export { MarketView }
