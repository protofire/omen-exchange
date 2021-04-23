import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { Status } from '../util/types'

import { GraphResponseFixedProductMarketMaker, wrangleMarketDataResponse } from './useGraphMarketMakerData'

const query = gql`
  query GetLiquidityMiningCampaignData {
    liquidityMiningCampaigns {
      id
      initialized
      owner
      startsAt
      endsAt
      duration
      locked
      fpmm
      rewardTokens
      rewardAmounts
      stakedAmount
    }
  }
`

type LMStakeEvent = {
  id: string
  user: string
  timestamp: string
  liquidityMiningCampaign: GraphResponseLiquidityMiningCampaign
  amounts: BigNumber[]
}

type LMRecovery = {
  id: string
  timestamp: string
  liquidityMiningCampaign: GraphResponseLiquidityMiningCampaign
  amounts: BigNumber[]
}

type Token = {
  id: string
  scale: BigNumber
  ethPerToken: BigNumber
}

type GraphResponseLiquidityMiningCampaign = {
  id: string
  initialized: boolean
  owner: string
  startsAt: string
  endsAt: string
  duration: string
  locked: boolean
  fpmm: GraphResponseFixedProductMarketMaker
  rewardTokens: Token[]
  rewardAmounts: BigNumber[]
  stakedAmount: BigNumber
  deposits: LMStakeEvent[]
  withdrawals: LMStakeEvent[]
  claims: LMStakeEvent[]
  recoveries: LMRecovery[]
}

type Result = {
  fetchData: () => Promise<void>
  liquidityMiningCampaigns: Maybe<GraphResponseLiquidityMiningCampaign[]>
  status: Status
}

/**
 * Get lm campaigns from the subgraph
 */
export const useGraphLiquidityMiningCampaigns = (networkId: number): Result => {
  const [liquidityMiningCampaigns, setLiquidityMiningCampaignData] = useState<
    Maybe<GraphResponseLiquidityMiningCampaign[]>
  >(null)

  const { data, error, loading, refetch } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
  })

  useEffect(() => {
    if (!loading && data && data.liquidityMiningCampaigns) {
      const campaigns = data.liquidityMiningCampaigns.map((campaign: GraphResponseLiquidityMiningCampaign) => ({
        ...campaign,
        fpmm: wrangleMarketDataResponse(campaign.fpmm, networkId),
      }))
      setLiquidityMiningCampaignData(campaigns)
    }
    // eslint-disable-next-line
  }, [loading])

  const fetchData = async () => {
    await refetch()
  }

  return {
    liquidityMiningCampaigns,
    fetchData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
