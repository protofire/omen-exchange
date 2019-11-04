import React from 'react'

import { MarketHomeContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'

const MarketHomePage = () => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketHomeContainer />
    </ConnectedWeb3>
  )
}

export { MarketHomePage }
