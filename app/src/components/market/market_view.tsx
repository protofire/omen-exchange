import React from 'react'
import { BigNumber } from 'ethers/utils'

import { SectionTitle } from '../common/section_title'
import { ClosedMarketDetail } from './profile/closed_market_detail'
import { Status, BalanceItem, Token, Arbitrator } from '../../util/types'
import { View } from './profile/view'
import { formatDate } from '../../util/tools'

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
  const { balances, question, resolution, isQuestionFinalized } = props

  const renderView = () => {
    return isQuestionFinalized ? <ClosedMarketDetail {...props} /> : <View {...props} />
  }

  const winningOutcome = balances.find((balanceItem: BalanceItem) => balanceItem.winningOutcome)

  const formattedResolution = resolution ? formatDate(resolution) : ''
  const subtitle = isQuestionFinalized
    ? `Final Outcome: ${winningOutcome && winningOutcome.outcomeName}`
    : formattedResolution

  return (
    <>
      <SectionTitle title={question} subTitle={subtitle} />
      {renderView()}
    </>
  )
}

export { MarketView }
