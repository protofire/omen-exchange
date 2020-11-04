import { useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react'

import { CPKService } from '../services'
import { createCPK } from '../util/cpk'

/**
 * Returns an instance of CPKService. While the instance is being (asynchronously) created, the returned value is null.
 */
export const useCpk = (): Maybe<CPKService> => {
  const [cpk, setCpk] = useState<Maybe<CPKService>>(null)
  const { account, library } = useWeb3Context()

  useEffect(() => {
    const loadCpk = async () => {
      if (account && library) {
        const cpk = await createCPK(library)
        setCpk(new CPKService(cpk, library))
      }
    }
    loadCpk()
  }, [account, library])

  return cpk
}
