import React, { FC, useEffect, useState } from 'react'
import { BigNumber } from 'ethers/utils'
import { Buy } from './profile/buy'
import { SectionTitle } from '../common/section_title'
import { Sell } from './profile/sell'
import { ClosedMarketDetail } from './profile/closed_market_detail'
import { Status, BalanceItem, StepProfile, WinnerOutcome } from '../../util/types'
import { View } from './profile/view'
import { formatDate } from '../../util/tools'

interface Props {
  balance: BalanceItem[]
  funding: BigNumber
  question: string
  resolution: Maybe<Date>
  status: Status
  marketAddress: string
  stepProfile: StepProfile
  winnerOutcome: Maybe<WinnerOutcome>
}

const MarketView: FC<Props> = props => {
  const { funding, question, resolution, balance, marketAddress, stepProfile } = props
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
    setCurrentStep(StepProfile.CloseMarketDetail)
  }

  const handleWithdraw = (): void => {
    setCurrentStep(StepProfile.CloseMarketDetail)
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
      case StepProfile.CloseMarketDetail:
        return (
          <>
            <ClosedMarketDetail {...props} />
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
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      {renderView()}
    </>
  )
}

export { MarketView }
