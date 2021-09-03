import { useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../contexts/connectedWeb3'
import { OmenGuildService, Proposal } from '../services/guild'

interface ProposalResponse {
  proposals: Proposal[]
  loadingProposals: boolean
}

export const useGuildProposals = (): ProposalResponse => {
  const { account, library: provider, networkId, relay } = useConnectedWeb3Context()
  const [guild, setGuild] = useState<OmenGuildService>(new OmenGuildService(provider, networkId))
  const [loadingProposals, setLoadingProposals] = useState(true)
  const [proposals, setProposals] = useState<Proposal[]>([])

  const fetchProposals = async () => {
    try {
      setProposals(await guild.getProposals())
      setLoadingProposals(false)
    } catch {
      setLoadingProposals(false)
    }
  }

  useEffect(() => {
    fetchProposals()
    // eslint-disable-next-line
  }, [networkId, account, relay])

  useEffect(() => {
    if (account) {
      setGuild(new OmenGuildService(provider, networkId))
    }
    // eslint-disable-next-line
  }, [networkId, account, relay])

  return { proposals, loadingProposals }
}
