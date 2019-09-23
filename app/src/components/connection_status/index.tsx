import React from 'react'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'

import { truncateStringInTheMiddle } from '../../util/tools'
import { getContractAddressName } from '../../util/addresses'

const ConnectionStatus = (props: any) => {
  const context = useConnectedWeb3Context()
  const { account, networkId } = context

  const networkName = getContractAddressName(networkId)

  return (
    <div {...props}>
      Account: <label title={account}>{truncateStringInTheMiddle(account) || 'None'}</label> |
      Network: {networkName || 'None'}
    </div>
  )
}

export { ConnectionStatus }
