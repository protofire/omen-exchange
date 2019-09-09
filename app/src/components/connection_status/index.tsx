import React from 'react'
import { Web3Consumer } from 'web3-react'

const ConnectionStatus: React.FC = () => {
  return (
    <Web3Consumer>
      {(context: any) => {
        const { active, account, networkId } = context
        return (
          active && (
            <React.Fragment>
              <p>Account: {account || 'None'}</p>
              <p>Network ID: {networkId || 'None'}</p>
            </React.Fragment>
          )
        )
      }}
    </Web3Consumer>
  )
}

export { ConnectionStatus }
