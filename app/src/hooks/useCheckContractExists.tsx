import { useEffect, useState } from 'react'
import { ConnectedWeb3Context } from './connectedWeb3'
import { isContract } from '../util/tools'

export const useCheckContractExists = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): boolean => {
  const [contractExists, setContractExists] = useState<boolean>(true)

  useEffect(() => {
    const provider = context.library
    const fetchIsContract = async () => {
      setContractExists(await isContract(provider, marketMakerAddress))
    }

    fetchIsContract()
  }, [context, marketMakerAddress])

  return contractExists
}
