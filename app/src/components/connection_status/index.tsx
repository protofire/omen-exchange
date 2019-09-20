import React from 'react'
import { Web3Consumer } from 'web3-react'

import { truncateStringInTheMiddle } from '../../util/tools'
import { getContractAddressName } from '../../util/addresses'

const ConnectionStatus = (props: any) => {
  return (
    <Web3Consumer>
      {(context: any) => {
        const { active, account, networkId } = context
        const networkName = getContractAddressName(networkId)
        return (
          active && (
            <div {...props}>
              Account: <label title={account}>{truncateStringInTheMiddle(account) || 'None'}</label>{' '}
              | Network: {networkName || 'None'}
            </div>
          )
        )
      }}
    </Web3Consumer>
  )
}

export { ConnectionStatus }
