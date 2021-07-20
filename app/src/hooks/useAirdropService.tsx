import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { AirdropService } from '../services'

import { useConnectedWeb3Context } from './connectedWeb3'

export const useAirdropService = (): { airdrop: AirdropService; claimAmount: BigNumber } => {
  const { account, library: provider, networkId, relay } = useConnectedWeb3Context()

  const [airdrop, setAirdrop] = useState<AirdropService>(new AirdropService(networkId, provider, account, relay))
  const [claimAmount, setClaimAmount] = useState(new BigNumber('0'))

  useEffect(() => {
    let active = true
    const getClaimAmount = async () => {
      const newAmount = await airdrop.getClaimAmount(account)
      if (active) {
        setClaimAmount(newAmount)
      }
    }
    if (account) {
      getClaimAmount()
    }
    return () => {
      active = false
    }
  }, [airdrop, airdrop.relay, account, relay, networkId])

  useEffect(() => {
    if (account) {
      setAirdrop(new AirdropService(networkId, provider, account, relay))
    }
    // eslint-disable-next-line
  }, [networkId, account, relay])

  return { airdrop, claimAmount }
}
