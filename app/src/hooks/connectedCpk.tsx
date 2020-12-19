import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'

import { CPKService } from '../services'
import { createCPK } from '../util/cpk'

const ConnectedCPKContext = React.createContext<Maybe<CPKService>>(null)

export const useConnectedCPKContext = () => React.useContext(ConnectedCPKContext)

/**
 * Returns an instance of CPKService. While the instance is being (asynchronously) created, the returned value is null.
 */
export const ConnectedCPK: React.FC = props => {
  const [cpk, setCpk] = useState<Maybe<CPKService>>(null)
  const { account, library } = useWeb3React()
  useEffect(() => {
    if (account && library) {
      createCPK(library)
        .then(cpk => new CPKService(cpk, library))
        .then(setCpk)
    }
  }, [account, library])

  return <ConnectedCPKContext.Provider value={cpk}>{props.children}</ConnectedCPKContext.Provider>
}
