import React from 'react'

import { ConnectedWeb3, useConnectWeb3 } from '../../hooks/connectedWeb3'

const MarketPermission = (props: any) => {
  useConnectWeb3()

  return <ConnectedWeb3>{props.children}</ConnectedWeb3>
}

export { MarketPermission }
