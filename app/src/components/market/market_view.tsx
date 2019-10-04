import React, { FC, useEffect, useState } from 'react'
import { BigNumber } from 'ethers/utils'
import { Buy } from './profile/buy'
import { SectionTitle } from '../common/section_title'
import { Sell } from './profile/sell'
import { Redeem } from './profile/redeem'
import { Withdraw } from './profile/withdraw'
import { Status, BalanceItems, StepProfile, WinnerOutcome } from '../../util/types'
import { View } from './profile/view'
import { formatDate } from '../../util/tools'

interface Props {
  balance: BalanceItems[]
  funding: BigNumber
  question: string
  resolution: Date
  status: Status
  marketAddress: string
  stepProfile: StepProfile
  winnerOutcome: Maybe<WinnerOutcome>
}

const MarketView: FC<Props> = props => {
  const {
    funding,
    question,
    resolution,
    balance,
    marketAddress,
    stepProfile,
    winnerOutcome,
  } = props
  const [currentStep, setCurrentStep] = useState<StepProfile>(stepProfile)

  useEffect(() => {
    setCurrentStep(stepProfile)
  }, [stepProfile])

  const handleFinish = (): void => {
    setCurrentStep(StepProfile.View)
  }

  const handleBack = (): void => {
    setCurrentStep(StepProfile.View)
  }

  const handleBuy = (): void => {
    setCurrentStep(StepProfile.Buy)
  }

  const handleSell = (): void => {
    setCurrentStep(StepProfile.Sell)
  }

  const handleRedeem = (): void => {
    setCurrentStep(StepProfile.Redeem)
  }

  const handleWithdraw = (): void => {
    setCurrentStep(StepProfile.Withdraw)
  }

  const renderView = () => {
    switch (currentStep) {
      case StepProfile.View:
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
      case StepProfile.Buy:
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
      case StepProfile.Sell:
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
      case StepProfile.Redeem:
        return (
          <>
            <Redeem
              handleFinish={() => handleFinish()}
              marketAddress={marketAddress}
              balance={balance}
            />
          </>
        )
      case StepProfile.Withdraw:
        return (
          <>
            <Withdraw handleFinish={() => {}} winnerOutcome={winnerOutcome} />
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
