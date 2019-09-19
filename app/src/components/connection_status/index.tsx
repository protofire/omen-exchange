import React from 'react'
import { Web3Consumer } from 'web3-react'

import { truncateStringInTheMiddle } from '../../util/tools'
import { networkIds } from '../../util/addresses'

const ConnectionStatus = (props: any) => {
  return (
    <Web3Consumer>
      {(context: any) => {
        const { active, account, networkId } = context
        const networkName = Object.keys(networkIds).find(
          key => (networkIds as any)[key] === networkId,
        )
        const networkNameCase =
          networkName &&
          networkName.substr(0, 1).toUpperCase() + networkName.substr(1).toLowerCase()
        return (
          active && (
            <div {...props}>
              Account: <label title={account}>{truncateStringInTheMiddle(account) || 'None'}</label>{' '}
              | Network: {networkNameCase || 'None'}
            </div>
          )
        )
      }}
    </Web3Consumer>
  )
}

export { ConnectionStatus }
