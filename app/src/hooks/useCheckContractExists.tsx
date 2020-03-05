import { useEffect, useState } from 'react'

import { isContract } from '../util/tools'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useCheckContractExists = (marketMakerAddress: string, context: ConnectedWeb3Context): boolean => {
  const [contractExists, setContractExists] = useState<boolean>(true)

  useEffect(() => {
    let isSubscribed = true
    const provider = context.library
    const fetchIsContract = async () => {
      if (isSubscribed) setContractExists(await isContract(provider, marketMakerAddress))
    }

    fetchIsContract()
    return () => {
      isSubscribed = false
    }
  }, [context, marketMakerAddress])

  return contractExists
}
