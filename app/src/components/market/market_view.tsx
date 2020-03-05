import { BigNumber } from 'ethers/utils'
import React from 'react'

import { Arbitrator, BalanceItem, Status, Token } from '../../util/types'
import { SectionTitle } from '../common/section_title'

import { ClosedMarketDetail } from './profile/closed_market_detail'
import { View } from './profile/view'

interface Props {
  account: Maybe<string>
  balances: BalanceItem[]
  funding: BigNumber
  status: Status
  marketMakerAddress: string
  collateral: Token
  question: string
  questionId: string
  category: string
  resolution: Maybe<Date>
  arbitrator: Maybe<Arbitrator>
  isQuestionFinalized: boolean
  isConditionResolved: boolean
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
