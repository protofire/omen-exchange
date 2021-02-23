import { ethers, providers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react'

import connectors, { handleGsMultiSend } from '../util/connectors'
import { calcRelayProxyAddress } from '../util/cpk'
import { getLogger } from '../util/logger'
import { getInfuraUrl, networkIds } from '../util/networks'

import { useSafeApp } from './useSafeApp'

const logger = getLogger('Hooks::ConnectedWeb3')

export interface ConnectedWeb3Context {
  account: Maybe<string>
  library: providers.Web3Provider
  networkId: number
  rawWeb3Context: any
  relay: boolean
  toggleRelay: () => void
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
  const safeAppInfo = useSafeApp()
  const context = useWeb3Context()

  const { account, active, error, library } = context

  const [relay, setRelay] = useState(true)
  const toggleRelay = () => setRelay(!relay)

  useEffect(() => {
    let isSubscribed = true
    const connector = localStorage.getItem('CONNECTOR')
    if (safeAppInfo) {
      if (context.connectorName !== 'Safe') {
        localStorage.removeItem('CONNECTOR')
        const netId = (networkIds as any)[safeAppInfo.network.toUpperCase()]
        connectors.Safe.init(safeAppInfo.safeAddress, netId)
        context.setConnector('Safe')
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

    handleGsMultiSend()

    // disabled block tracker
    if (context.connector) {
      if (
        context.connector.engine &&
        context.connector.engine._blockTracker &&
        context.connector.engine._blockTracker._isRunning
      ) {
        context.connector.engine.stop()
      }
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
  }, [context, library, active, error, networkId, safeAppInfo])

  if (!networkId || !library) {
    return null
  }

  let netId = networkId
  let provider = library
  let isRelay = false
  let address = account

  // provider override if running as relay
  if (relay && networkId === networkIds.MAINNET && account) {
    isRelay = true
    netId = networkIds.XDAI
    provider = new ethers.providers.JsonRpcProvider(getInfuraUrl(netId))
    address = calcRelayProxyAddress(account, provider)
    const signer = library.getSigner()
    const fakeSigner = {
      provider,
      getAddress: () => address,
      _ethersType: 'Signer',
      // the actual signer for relay sigs
      signer: signer,
    }
    provider.signer = fakeSigner
    provider.getSigner = () => fakeSigner
  }

  const value = {
    account: address || null,
    library: provider,
    networkId: netId,
    rawWeb3Context: context,
    relay: isRelay,
    toggleRelay,
  }

  return <ConnectedWeb3Context.Provider value={value}>{props.children}</ConnectedWeb3Context.Provider>
}

export const WhenConnected: React.FC = props => {
  const { account } = useConnectedWeb3Context()

  return <>{account && props.children}</>
}
