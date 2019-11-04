import React, { ChangeEvent, useEffect, useState } from 'react'

import { MarketAndQuestion, Status } from '../../util/types'
import { FullLoading } from '../common/full_loading'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'

interface Props {
  status: Status
  markets: MarketAndQuestion[]
}

export const MarketHome = (props: Props) => {
  const context = useConnectedWeb3Context()
  const [marketsFiltered, setMarketsFiltered] = useState<MarketAndQuestion[]>([])

  const { status, markets } = props

  useEffect(() => {
    setMarketsFiltered(markets)
  }, [markets])

  const filterMarkets = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked

    if (isChecked) {
      setMarketsFiltered(
        markets.filter(
          (market: MarketAndQuestion) =>
            market.ownerAddress.toLowerCase() === context.account.toLowerCase(),
        ),
      )
    } else {
      setMarketsFiltered(markets)
    }
  }

  return (
    <>
      <div>
        <input onChange={filterMarkets} type="checkbox" />
        <label>Markets that I own</label>
      </div>
      <div>
        <pre>{JSON.stringify(marketsFiltered, null, 2)}</pre>
      </div>
      {status === Status.Loading ? <FullLoading message="Loading markets..." /> : null}
    </>
  )
}
