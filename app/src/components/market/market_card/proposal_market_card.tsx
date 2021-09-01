import React from 'react'
import { useHistory } from 'react-router'

import { useGraphMarketMakerData } from '../../../hooks/graph/useGraphMarketMakerData'
import { Proposal } from '../../../services/guild'

import { MarketCard } from './market_card'

interface Props {
  proposal: Proposal
  networkId: number
  onClick?: () => void
}

export const ProposalMarketCard = (props: Props) => {
  const { networkId, proposal } = props
  const { marketMakerData } = useGraphMarketMakerData(proposal.description, networkId)
  const history = useHistory()

  if (!marketMakerData) {
    return <div />
  }

  const onClick = () => {
    history.push(`/proposals/${proposal.id}`)
  }

  // @ts-expect-error ignore
  return <MarketCard market={marketMakerData} networkId={networkId} onClick={onClick} proposal={proposal} />
}
