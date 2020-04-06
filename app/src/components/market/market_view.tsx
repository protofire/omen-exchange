import React from 'react'
import { Helmet } from 'react-helmet'

import { DOCUMENT_TITLE } from '../../common/constants'
import { MarketMakerData, Status, Token } from '../../util/types'
import { SectionTitle } from '../common'

import { ClosedMarketDetail } from './profile/closed_market_detail'
import { View } from './profile/view'

interface Props {
  account: Maybe<string>
  collateral: Token
  marketMakerAddress: string
  marketMakerData: MarketMakerData
  questionRaw: string
  questionTemplateId: number
  status: Status
}

const MarketView: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const { isQuestionFinalized, question } = marketMakerData

  const renderView = () => {
    return isQuestionFinalized ? <ClosedMarketDetail {...props} /> : <View {...props} />
  }

  return (
    <>
      <Helmet>
        <title>{`${question} - ${DOCUMENT_TITLE}`}</title>
      </Helmet>
      <SectionTitle goBackEnabled title={question} />
      {renderView()}
    </>
  )
}

export { MarketView }
