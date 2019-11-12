import React from 'react'
import { ethers } from 'ethers'
import { INFURA_PROJECT_ID } from '../common/constants'

export interface DisconnectedWeb3Context {
  library: any
  networkId: number
}

const DisconnectedWeb3Context = React.createContext<Maybe<DisconnectedWeb3Context>>(null)

export const useDisconnectedWeb3Context = () => {
  const context = React.useContext(DisconnectedWeb3Context)

  if (!context) {
    throw new Error('Component rendered outside the provider tree')
  }

  return context
}

export const DisconnectedWeb3: React.FC<{ children: React.ReactNode }> = props => {
  const network = process.env.NODE_ENV === 'development' ? 'rinkeby' : 'homestead'

  const provider = new ethers.providers.InfuraProvider(network, INFURA_PROJECT_ID)
  const networkId = process.env.NODE_ENV === 'development' ? 4 : 1

  const value = { library: provider, networkId }

  return (
    <DisconnectedWeb3Context.Provider value={value}>
      {props.children}
    </DisconnectedWeb3Context.Provider>
  )
}
