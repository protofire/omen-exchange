import { useEffect, useState } from 'react'

import { AirdropService } from '../services'

import { useConnectedWeb3Context } from './connectedWeb3'

export const useAirdropService = (): AirdropService => {
  const { account, library: provider, networkId } = useConnectedWeb3Context()

  const [airdrop, setAirdrop] = useState<AirdropService>(new AirdropService(networkId, provider, account))

  useEffect(() => {
    if (account) {
      setAirdrop(new AirdropService(networkId, provider, account))
    }
    // eslint-disable-next-line
  }, [networkId, account])

  return airdrop
}
