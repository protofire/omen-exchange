import { useEffect, useState } from 'react'

import { CPKService } from '../services'
import { createCPK } from '../util/cpk'

import { useConnectedWeb3Context } from './connectedWeb3'

/**
 * Returns an instance of CPKService. While the instance is being (asynchronously) created, the returned value is null.
 */

export const useConnectedCPKContext = (): Maybe<CPKService> => {
  const [cpk, setCpk] = useState<Maybe<CPKService>>(null)
  const { account, library, networkId, relay } = useConnectedWeb3Context()

  useEffect(() => {
    if (account && library) {
      createCPK(library, relay)
        .then(cpk => new CPKService(cpk, library))
        .then(setCpk)
    }
  }, [account, library, networkId, relay])
  return cpk
}
