import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { isContract } from '../util/tools'

export const useCheckContractExists = (marketMakerAddress: string): boolean => {
  const { library } = useWeb3React()
  const [contractExists, setContractExists] = useState<boolean>(true)

  useEffect(() => {
    let isSubscribed = true
    const fetchIsContract = async () => {
      if (isSubscribed && library) setContractExists(await isContract(library, marketMakerAddress))
    }

    fetchIsContract()
    return () => {
      isSubscribed = false
    }
  }, [library, marketMakerAddress])

  return contractExists
}
