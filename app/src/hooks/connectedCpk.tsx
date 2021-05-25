import { useEffect, useState } from 'react'

import { CPKService } from '../services'
import { createCPK } from '../util/cpk'

import { useConnectedWeb3Context } from './connectedWeb3'

/**
 * Returns an instance of CPKService. While the instance is being (asynchronously) created, the returned value is null.
 */

export const useRawCpk = (context: any) => {
  const [cpk, setCpk] = useState<Maybe<CPKService>>(null)
  useEffect(() => {
    if (context) {
      const { account, library, relay } = context
      if (account && library) {
        createCPK(library, relay)
          .then(cpk => new CPKService(cpk, library))
          .then(setCpk)
      }
    }
  }, [context])
  return cpk
}

export const useConnectedCPKContext = (): Maybe<CPKService> => {
  const context = useConnectedWeb3Context()
  const cpk = useRawCpk(context)
  return cpk
}
