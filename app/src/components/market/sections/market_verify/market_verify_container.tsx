import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { ConnectedWeb3Context } from '../../../../hooks'
import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketVerify } from './market_verify'

interface Props {
  marketMakerData: MarketMakerData
  context: ConnectedWeb3Context
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketVerifyContainer: React.FC<Props> = (props: Props) => {
  const { context, fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props

  const history = useHistory()

  useEffect(() => {
    history.replace(`/${marketMakerData.address}/verify`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MarketVerify
      context={context}
      fetchGraphMarketMakerData={fetchGraphMarketMakerData}
      marketMakerData={marketMakerData}
      switchMarketTab={switchMarketTab}
    />
  )
}

export { MarketVerifyContainer }
