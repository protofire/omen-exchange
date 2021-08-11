import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../contexts/connectedWeb3'
import { AirdropService } from '../services'

interface Status {
  active: boolean
}

interface AirdropServiceParams {
  airdrop: AirdropService
  claimAmount: BigNumber
  fetchClaimAmount: (status?: Status) => Promise<void>
}

export const useAirdropService = (): AirdropServiceParams => {
  const { account, library: provider, networkId } = useConnectedWeb3Context()

  const [airdrop, setAirdrop] = useState<AirdropService>(new AirdropService(networkId, provider, account))
  const [claimAmount, setClaimAmount] = useState(new BigNumber('0'))

  const fetchClaimAmount = async (status?: Status) => {
    const newAmount = await airdrop.getClaimAmount(account)
    if (!status || status.active) {
      setClaimAmount(newAmount)
    }
  }

  useEffect(() => {
    const status = { active: true }
    if (account) {
      fetchClaimAmount(status)
    }
    return () => {
      status.active = false
    }
    // eslint-disable-next-line
  }, [airdrop, account, networkId])

  useEffect(() => {
    if (account) {
      setAirdrop(new AirdropService(networkId, provider, account))
    }
    // eslint-disable-next-line
  }, [networkId, account])

  return { airdrop, claimAmount, fetchClaimAmount }
}
