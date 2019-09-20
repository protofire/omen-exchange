import { providers } from 'ethers'
import React, { useState, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'

const ConnectedWeb3Context = React.createContext<{
  account: string
  library: providers.BaseProvider
} | null>(null)

/**
 * This hook can only be used by components under the `ConnectedWeb3` component. Otherwise it will throw.
 */
export const useConnectedWeb3Context = () => {
  const context = React.useContext(ConnectedWeb3Context)

  if (!context) {
    throw new Error('Component rendered outside the provider tree')
  }

  return {
    ...context,
    networkId: context.library.network.chainId,
  }
}

/**
 * Component used to render components that depend on Web3 being available. These components can then
 * `useConnectedWeb3Context` safely to get web3 stuff without having to null check it.
 */
export const ConnectedWeb3: React.FC<{ children: React.ReactNode }> = props => {
  const [ready, setReady] = useState(false)
  const context = useWeb3Context()
  useEffect(() => {
    const checkIfReady = async () => {
      if (context.library) {
        await context.library.ready
        setReady(true)
      }
    }

    checkIfReady()
  }, [context.library])

  if (!context.account || !ready || !context.library.network) {
    return null
  }

  const value = { account: context.account, library: context.library }

  return (
    <ConnectedWeb3Context.Provider value={value}>{props.children}</ConnectedWeb3Context.Provider>
  )
}
