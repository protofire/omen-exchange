import { BigNumber } from 'ethers/utils'
import React from 'react'

import { Arbitrator, BalanceItem, Status, Token } from '../../util/types'
import { SectionTitle } from '../common'

import { ClosedMarketDetail } from './profile/closed_market_detail'
import { View } from './profile/view'

interface Props {
  account: Maybe<string>
  arbitrator: Maybe<Arbitrator>
  balances: BalanceItem[]
  category: string
  collateral: Token
  funding: BigNumber
  isConditionResolved: boolean
  isQuestionFinalized: boolean
  marketMakerAddress: string
  question: string
  questionId: string
  resolution: Maybe<Date>
  status: Status
  lastDayVolume: Maybe<BigNumber>
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
}

const MarketView: React.FC<Props> = (props: Props) => {
  const { isQuestionFinalized, question } = props

  const renderView = () => {
    return isQuestionFinalized ? <ClosedMarketDetail {...props} /> : <View {...props} />
  }

  return (
    <>
      <SectionTitle goBackEnabled title={question} />
      {renderView()}
    </>
  )
}

export { MarketView }
