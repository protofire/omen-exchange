import { BigNumber } from 'ethers/utils'
import React from 'react'

import { formatDate } from '../../util/tools'
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
  const { balances, isQuestionFinalized, question, resolution } = props

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
      <SectionTitle subTitle={subtitle} title={question} />
      {renderView()}
    </>
  )
}

export { MarketView }
