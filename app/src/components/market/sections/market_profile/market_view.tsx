import React from 'react'
import { Helmet } from 'react-helmet'

import { DOCUMENT_TITLE } from '../../../../common/constants'
import { MarketMakerData } from '../../../../util/types'
import { SectionTitle } from '../../../common'

import { ClosedMarketDetail } from './market_status/closed'
import { OpenMarketDetails } from './market_status/open'

interface Props {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const MarketView: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const { isQuestionFinalized, question } = marketMakerData

  const renderView = () => {
    return isQuestionFinalized ? <ClosedMarketDetail {...props} /> : <OpenMarketDetails {...props} />
  }

  return (
    <>
      <Helmet>
        <title>{`${question.title} - ${DOCUMENT_TITLE}`}</title>
      </Helmet>
      <SectionTitle goBackEnabled title={question.title} />
      {renderView()}
    </>
  )
}

export { MarketView }
