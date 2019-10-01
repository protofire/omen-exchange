import React, { FC, useState } from 'react'
import { BigNumber } from 'ethers/utils'
import { Buy } from './profile/buy'
import { SectionTitle } from '../common/section_title'
import { Sell } from './profile/sell'
import { Redeem } from './profile/redeem'
import { Withdraw } from './profile/withdraw'
import { Status, BalanceItems } from '../../util/types'
import { View } from './profile/view'
import { formatDate } from '../../util/tools'

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
  Redeem = 'Redeem',
  Withdraw = 'Withdraw',
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

  const handleRedeem = (): void => {
    setCurrentStep(Step.Redeem)
  }

  const handleWithdraw = (): void => {
    setCurrentStep(Step.Withdraw)
  }

  const renderView = () => {
    switch (currentStep) {
      case Step.View:
        return (
          <>
            <View
              handleBuy={() => handleBuy()}
              handleRedeem={() => handleRedeem()}
              handleWithdraw={() => handleWithdraw()}
              handleSell={() => handleSell()}
              {...props}
            />
          </>
        )
      case Step.Buy:
        return (
          <>
            <Buy
              balance={balance}
              funding={funding}
              handleBack={() => handleBack()}
              handleFinish={() => handleFinish()}
              marketAddress={marketAddress}
            />
          </>
        )
      case Step.Sell:
        return (
          <>
            <Sell handleBack={() => handleBack()} handleFinish={() => handleFinish()} />
          </>
        )
      case Step.Redeem:
        return (
          <>
            <Redeem handleFinish={() => {}} />
          </>
        )
      case Step.Withdraw:
        return (
          <>
            <Withdraw handleFinish={() => {}} />
          </>
        )
      default:
        return (
          <>
            <View
              handleBuy={() => handleBuy()}
              handleRedeem={() => handleRedeem()}
              handleSell={() => handleSell()}
              handleWithdraw={() => handleWithdraw()}
              {...props}
            />
          </>
        )
    }
  }

  return (
    <>
      <SectionTitle title={question} subTitle={`${formatDate(resolution)}`} />
      {renderView()}
    </>
  )
}

export { MarketView }
