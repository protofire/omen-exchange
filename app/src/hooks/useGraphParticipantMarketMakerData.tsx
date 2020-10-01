import { useQuery } from '@apollo/react-hooks'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useState } from 'react'

import { Status } from '../util/types'

const query = gql`
  query GetParticipantMarket($id: ID!) {
    fpmmParticipation(id: $id) {
      id
      collateralToken
      fee
      category
      language
      arbitrator
      creationTimestamp
      openingTimestamp
      timeout
      poolTokens
      poolTokensUSD
      outcomeShares
      outcomeSharesUSD
    }
  }
`

type GraphResponseParticipantFixedProductMarketMaker = {
  id: string
  arbitrator: string
  category: string
  collateralToken: string
  fee: string
  language: string
  creationTimestamp: string
  openingTimestamp: string
  poolTokens: BigNumber
  poolTokensUSD: BigNumber
  outcomeShares: BigNumber
  outcomeSharesUSD: BigNumber
  timeout: string
}

type GraphResponse = {
  fpmmParticipation: Maybe<GraphResponseParticipantFixedProductMarketMaker>
}

export type GraphParticipantMarketMakerData = {
  address: string
  arbitratorAddress: string
  collateralAddress: string
  creationTimestamp: string
  fee: BigNumber
  poolTokens: BigNumber
  poolTokensUSD: BigNumber
  outcomeShares: BigNumber
  outcomeSharesUSD: BigNumber
}

type Result = {
  marketMakerData: Maybe<GraphParticipantMarketMakerData>
  status: Status
}

const wrangleResponse = (data: GraphResponseParticipantFixedProductMarketMaker): GraphParticipantMarketMakerData => {
  return {
    address: data.id,
    arbitratorAddress: data.arbitrator,
    collateralAddress: data.collateralToken,
    creationTimestamp: data.creationTimestamp,
    fee: bigNumberify(data.fee),
    poolTokens: data.poolTokens,
    poolTokensUSD: data.poolTokensUSD,
    outcomeShares: data.outcomeShares,
    outcomeSharesUSD: data.outcomeSharesUSD,
  }
}

/**
 * Get data from the graph for the given market maker. All the information returned by this hook comes from the graph,
 * other necessary information should be fetched from the blockchain.
 */
export const useGraphParticipantMarketMakerData = (id: string): Result => {
  const [marketMakerData, setMarketMakerData] = useState<Maybe<GraphParticipantMarketMakerData>>(null)

  const { data, error, loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: marketMakerData !== null,
    variables: { id: id },
  })

  if (data && data.fpmmParticipation && !marketMakerData) {
    setMarketMakerData(wrangleResponse(data.fpmmParticipation))
  }

  return {
    marketMakerData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
