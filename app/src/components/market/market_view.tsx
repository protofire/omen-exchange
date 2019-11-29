import React from 'react'
import { BigNumber } from 'ethers/utils'

import { SectionTitle } from '../common/section_title'
import { ClosedMarketDetail } from './profile/closed_market_detail'
import { Status, BalanceItem, Token, Arbitrator } from '../../util/types'
import { View } from './profile/view'
import { formatDate } from '../../util/tools'

interface Props {
  balance: BalanceItem[]
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
  const { question, resolution, isQuestionFinalized } = props

  const renderView = () => {
    return isQuestionFinalized ? <ClosedMarketDetail {...props} /> : <View {...props} />
  }

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      {renderView()}
    </>
  )
}

export { MarketView }
