import { useEffect, useState } from 'react'
import { ConnectedWeb3Context } from './connectedWeb3'
import { isContract } from '../util/tools'

export const useCheckContractExist = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): { contractExist: boolean } => {
  const [contractExist, setContractExist] = useState<boolean>(true)

  useEffect(() => {
    const provider = context.library
    const fetchIsContract = async () => {
      setContractExist(await isContract(provider, marketMakerAddress))
    }

    fetchIsContract()
  }, [context, marketMakerAddress])

  return {
    contractExist,
  }
}
