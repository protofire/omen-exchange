import { useQuery } from '@apollo/react-hooks'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useState } from 'react'

import { getOutcomes } from '../util/networks'
import { Question, Status } from '../util/types'

const query = gql`
  query GetMarket($id: ID!) {
    fixedProductMarketMaker(id: $id) {
      id
      creator
      collateralToken
      fee
      collateralVolume
      outcomeTokenAmounts
      condition {
        id
        payouts
      }
      templateId
      title
      outcomes
      category
      language
      lastActiveDay
      runningDailyVolume
      arbitrator
      creationTimestamp
      openingTimestamp
      timeout
      resolutionTimestamp
      currentAnswer
      answerFinalizedTimestamp
      scaledLiquidityParameter
      runningDailyVolumeByHour
      isPendingArbitration
      arbitrationOccurred
      currentAnswerTimestamp
      runningDailyVolumeByHour
      question {
        id
        data
      }
      klerosTCRitemID
      klerosTCRregistered
    }
  }
`

type GraphResponseFixedProductMarketMaker = {
  id: string
  answerFinalizedTimestamp: Maybe<string>
  arbitrator: string
  category: string
  collateralToken: string
  collateralVolume: string
  condition: {
    id: string
    payouts: Maybe<string[]>
  }
  creator: string
  currentAnswer: string
  fee: string
  lastActiveDay: string
  runningDailyVolume: string
  language: string
  creationTimestamp: string
  openingTimestamp: string
  outcomeTokenAmounts: string[]
  outcomes: Maybe<string[]>
  isPendingArbitration: boolean
  arbitrationOccurred: boolean
  currentAnswerTimestamp: BigNumber
  runningDailyVolumeByHour: BigNumber[]
  question: {
    id: string
    data: string
  }
  resolutionTimestamp: string
  templateId: string
  timeout: string
  title: string
  scaledLiquidityParameter: string
  klerosTCRregistered: boolean
  curatedByDxDao: boolean
  curatedByDxDaoOrKleros: boolean
  runningDailyVolumeByHour: BigNumber[]
}

type GraphResponse = {
  fixedProductMarketMaker: Maybe<GraphResponseFixedProductMarketMaker>
}

export type GraphMarketMakerData = {
  address: string
  answerFinalizedTimestamp: Maybe<BigNumber>
  arbitratorAddress: string
  collateralAddress: string
  creationTimestamp: string
  collateralVolume: BigNumber
  lastActiveDay: number
  dailyVolume: BigNumber
  conditionId: string
  payouts: Maybe<number[]>
  fee: BigNumber
  question: Question
  scaledLiquidityParameter: number
  klerosTCRregistered: boolean
  curatedByDxDao: boolean
  curatedByDxDaoOrKleros: boolean
  runningDailyVolumeByHour: BigNumber[]
}

type Result = {
  marketMakerData: Maybe<GraphMarketMakerData>
  status: Status
}

const wrangleResponse = (data: GraphResponseFixedProductMarketMaker, networkId: number): GraphMarketMakerData => {
  const outcomes = data.outcomes ? data.outcomes : getOutcomes(networkId, +data.templateId)

  return {
    address: data.id,
    answerFinalizedTimestamp: data.answerFinalizedTimestamp ? bigNumberify(data.answerFinalizedTimestamp) : null,
    arbitratorAddress: data.arbitrator,
    collateralAddress: data.collateralToken,
    creationTimestamp: data.creationTimestamp,
    collateralVolume: bigNumberify(data.collateralVolume),
    lastActiveDay: Number(data.lastActiveDay),
    dailyVolume: bigNumberify(data.runningDailyVolume),
    conditionId: data.condition.id,
    payouts: data.condition.payouts ? data.condition.payouts.map(Number) : null,
    fee: bigNumberify(data.fee),
    scaledLiquidityParameter: parseFloat(data.scaledLiquidityParameter),
    runningDailyVolumeByHour: data.runningDailyVolumeByHour,
    question: {
      id: data.question.id,
      templateId: +data.templateId,
      raw: data.question.data,
      title: data.title,
      category: data.category,
      resolution: new Date(1000 * +data.openingTimestamp),
      arbitratorAddress: data.arbitrator,
      outcomes,
      isPendingArbitration: data.isPendingArbitration,
      arbitrationOccurred: data.arbitrationOccurred,
      currentAnswerTimestamp: data.currentAnswerTimestamp,
    },
    curatedByDxDao: data.curatedByDxDao,
    klerosTCRregistered: data.klerosTCRregistered,
    curatedByDxDaoOrKleros: data.curatedByDxDaoOrKleros,
  }
}

/**
 * Get data from the graph for the given market maker. All the information returned by this hook comes from the graph,
 * other necessary information should be fetched from the blockchain.
 */
export const useGraphMarketMakerData = (marketMakerAddress: string, networkId: number): Result => {
  const [marketMakerData, setMarketMakerData] = useState<Maybe<GraphMarketMakerData>>(null)

  const { data, error, loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: marketMakerData !== null,
    variables: { id: marketMakerAddress },
  })

  if (data && data.fixedProductMarketMaker && !marketMakerData) {
    setMarketMakerData(wrangleResponse(data.fixedProductMarketMaker, networkId))
  }

  return {
    marketMakerData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
