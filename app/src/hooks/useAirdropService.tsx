import { useEffect, useState } from 'react'

import { AirdropService } from '../services'

import { useConnectedWeb3Context } from './connectedWeb3'

export const useAirdropService = (): AirdropService => {
  const { library: provider, networkId } = useConnectedWeb3Context()

  const [airdrop, setAirdrop] = useState<AirdropService>(new AirdropService(networkId, provider))

  useEffect(() => {
    setAirdrop(new AirdropService(networkId, provider))
    // eslint-disable-next-line
  }, [networkId])

  return airdrop
}
