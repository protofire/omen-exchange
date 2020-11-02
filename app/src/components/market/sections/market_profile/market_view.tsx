import React from 'react'
import { Helmet } from 'react-helmet'

import {
  DOCUMENT_TITLE,
  REALITIO_PROXY_ADDRESS,
  REALITIO_PROXY_ADDRESS_RINKEBY,
  REALITIO_SCALAR_ADAPTER_ADDRESS,
  REALITIO_SCALAR_ADAPTER_ADDRESS_RINKEBY,
} from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { MarketMakerData } from '../../../../util/types'
import { SectionTitle, TextAlign } from '../../../common/text/section_title'

import { ClosedMarketDetails } from './market_status/closed'
import { ClosedScalarMarketDetails } from './market_status/closed_scalar'
import { OpenMarketDetails } from './market_status/open'
import { OpenScalarMarketDetails } from './market_status/open_scalar'

interface Props {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const MarketView: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const { isQuestionFinalized, oracle, question } = marketMakerData

  const context = useConnectedWeb3Context()
  const { networkId } = context

  const renderView = () => {
    let realitioProxy
    let realitioScalarAdapter
    if (networkId === 1) {
      realitioProxy = REALITIO_PROXY_ADDRESS.toLowerCase()
      realitioScalarAdapter = REALITIO_SCALAR_ADAPTER_ADDRESS.toLowerCase()
    } else if (networkId === 4) {
      realitioProxy = REALITIO_PROXY_ADDRESS_RINKEBY.toLowerCase()
      realitioScalarAdapter = REALITIO_SCALAR_ADAPTER_ADDRESS_RINKEBY.toLowerCase()
    }

    if (isQuestionFinalized) {
      if (oracle === realitioProxy) {
        return <ClosedMarketDetails {...props} />
      } else if (oracle === realitioScalarAdapter) {
        return <ClosedScalarMarketDetails {...props} />
      }
    } else {
      if (oracle === realitioProxy) {
        return <OpenMarketDetails {...props} />
      } else if (oracle === realitioScalarAdapter) {
        return <OpenScalarMarketDetails {...props} />
      }
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
