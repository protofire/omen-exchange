import SafeAppsSdkConnector from 'contract-proxy-kit/lib/esm/safeAppsSdkConnector'
import { providers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react'

import connectors from '../util/connectors'
import { getLogger } from '../util/logger'
import { networkIds } from '../util/networks'

const logger = getLogger('Hooks::ConnectedWeb3')

export interface ConnectedWeb3Context {
  account: Maybe<string>
  library: providers.Web3Provider
  networkId: number
  rawWeb3Context: any
}

const ConnectedWeb3Context = React.createContext<Maybe<ConnectedWeb3Context>>(null)

/**
 * This hook can only be used by components under the `ConnectedWeb3` component. Otherwise it will throw.
 */
export const useConnectedWeb3Context = () => {
  const context = React.useContext(ConnectedWeb3Context)

  if (!context) {
    throw new Error('Component rendered outside the provider tree')
  }

  return context
}

/**
 * Component used to render components that depend on Web3 being available. These components can then
 * `useConnectedWeb3Context` safely to get web3 stuff without having to null check it.
 */
export const ConnectedWeb3: React.FC = props => {
  const [networkId, setNetworkId] = useState<number | null>(null)
  const [safeSdk] = useState<SafeAppsSdkConnector>(new SafeAppsSdkConnector())
  const isSafeApp = safeSdk.isSafeApp()
  const context = useWeb3Context()
  const { account, active, error, library } = context

  useEffect(() => {
    let isSubscribed = true
    const connector = localStorage.getItem('CONNECTOR')
    if (isSafeApp && connector !== 'Safe') {
      if (safeSdk.safeAppInfo) {
        try {
          // @ts-expect-error ignore
          const netId = networkIds[safeSdk.safeAppInfo.network.toUpperCase()]
          connectors.Safe.init(safeSdk.safeAppInfo.safeAddress, netId)
          context.setConnector('Safe')
        } catch (e) {
          logger.log(e.message)
        }
      }
    } else if (active) {
      if (connector && connector in connectors) {
        context.setConnector(connector)
      }
    } else if (error) {
      logger.log(error.message)
      localStorage.removeItem('CONNECTOR')
      context.setConnector('Infura')
    } else {
      context.setConnector('Infura')
    }

    const checkIfReady = async () => {
      const network = await library.ready
      if (isSubscribed) setNetworkId(network.chainId)
    }

    if (library) {
      checkIfReady()
    }

    return () => {
      isSubscribed = false
    }
  }, [context, library, active, error, networkId, isSafeApp])

  if (!networkId || !library) {
    return null
  }

  const value = {
    account: account || null,
    library,
    networkId,
    rawWeb3Context: context,
  }

  return <ConnectedWeb3Context.Provider value={value}>{props.children}</ConnectedWeb3Context.Provider>
}

export const WhenConnected: React.FC = props => {
  const { account } = useConnectedWeb3Context()

  return <>{account && props.children}</>
}
