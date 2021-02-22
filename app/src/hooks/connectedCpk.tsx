import React, { useEffect, useState } from 'react'

import { CPKService } from '../services'
import { createCPK } from '../util/cpk'

import { useConnectedWeb3Context } from './connectedWeb3'

const ConnectedCPKContext = React.createContext<Maybe<CPKService>>(null)

/**
 * This hook can only be used by components under the `ConnectedWeb3` component. Otherwise it will throw.
 */
export const useConnectedCPKContext = () => React.useContext(ConnectedCPKContext)

/**
 * Returns an instance of CPKService. While the instance is being (asynchronously) created, the returned value is null.
 */
export const ConnectedCPK: React.FC = props => {
  const [cpk, setCpk] = useState<Maybe<CPKService>>(null)
  const { account, library, relay } = useConnectedWeb3Context()
  useEffect(() => {
    if (account && library) {
      createCPK(library, relay)
        .then(cpk => new CPKService(cpk, library))
        .then(setCpk)
    }
  }, [account, library, relay])

  return <ConnectedCPKContext.Provider value={cpk}>{props.children}</ConnectedCPKContext.Provider>
}
