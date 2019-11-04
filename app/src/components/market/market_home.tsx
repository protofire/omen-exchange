import * as React from 'react'
import { MarketAndQuestion, Status } from '../../util/types'
import { FullLoading } from '../common/full_loading'

interface Props {
  status: Status
  markets: MarketAndQuestion[]
}

export const MarketHome = (props: Props) => {
  const { status, markets } = props
  return (
    <>
      <div>
        <pre>{JSON.stringify(markets, null, 2)}</pre>
      </div>
      {status === Status.Loading ? <FullLoading message="Loading markets..." /> : null}
    </>
  )
}
