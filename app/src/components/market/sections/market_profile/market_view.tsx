import React from 'react'
import { Helmet } from 'react-helmet'

import {
  DOCUMENT_TITLE,
  REALITIO_SCALAR_ADAPTER_ADDRESS,
  REALITIO_SCALAR_ADAPTER_ADDRESS_RINKEBY,
} from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { MarketMakerData } from '../../../../util/types'
import { SectionTitle, TextAlign } from '../../../common/text/section_title'

import { ClosedMarketDetails } from './market_status/closed'
import { OpenMarketDetails } from './market_status/open'

interface Props {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const MarketView: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const { isQuestionFinalized, oracle, question } = marketMakerData

  const context = useConnectedWeb3Context()
  const networkId = context.networkId

  const renderView = () => {
    let realitioScalarAdapter
    if (networkId === 1) {
      realitioScalarAdapter = REALITIO_SCALAR_ADAPTER_ADDRESS.toLowerCase()
    } else if (networkId === 4) {
      realitioScalarAdapter = REALITIO_SCALAR_ADAPTER_ADDRESS_RINKEBY.toLowerCase()
    }

    let isScalar = false
    if (oracle === realitioScalarAdapter) {
      isScalar = true
    }

    if (isQuestionFinalized) {
      return <ClosedMarketDetails isScalar={isScalar} {...props} />
    } else {
      return <OpenMarketDetails isScalar={isScalar} {...props} />
    }
  }

  return (
    <>
      <Helmet>
        <title>{`${question.title} - ${DOCUMENT_TITLE}`}</title>
      </Helmet>
      <SectionTitle goBack={true} textAlign={TextAlign.left} title={question.title} />
      {renderView()}
    </>
  )
}

export { MarketView }
