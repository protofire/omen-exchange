import { useQuery } from '@apollo/react-hooks'
import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useMemo, useState } from 'react'

import { useCpk } from '../hooks'
import { DEFAULT_OPTIONS, buildQueryMyMarkets } from '../queries/markets_home'
import { getLogger } from '../util/logger'
import { getArbitratorsByNetwork, getOutcomes } from '../util/networks'
import { isObjectEqual, waitABit } from '../util/tools'
import {
  GraphResponseMarkets,
  GraphResponseMarketsGeneric,
  GraphResponseMyMarkets,
  KlerosSubmission,
  Question,
  Status,
} from '../util/types'

const logger = getLogger('useGraphMarketMakerData')

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
      curatedByDxDao
      curatedByDxDaoOrKleros
      question {
        id
        data
      }
      klerosTCRregistered
      curatedByDxDaoOrKleros
      curatedByDxDao
      submissionIDs {
        id
        status
      }
    }
  }
`

type Participations = {
  fixedProductMarketMakers: GraphResponseFixedProductMarketMaker
}

type GraphResponseAccountMarkets = {
  account: { fpmmParticipations: Participations[] }
}

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
  currentAnswerTimestamp: string
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
  submissionIDs: KlerosSubmission[]
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
  payouts: Maybe<Big[]>
  fee: BigNumber
  question: Question
  scaledLiquidityParameter: number
  klerosTCRregistered: boolean
  curatedByDxDao: boolean
  curatedByDxDaoOrKleros: boolean
  runningDailyVolumeByHour: BigNumber[]
  submissionIDs: KlerosSubmission[]
}

export type GraphMarketMakerDataCollection = GraphMarketMakerData[]

type Result = {
  fetchData: () => Promise<void>
  marketMakerData: Maybe<GraphMarketMakerDataCollection>
  status: Status
}

type MarketMakerAddresses = string

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
    payouts: data.condition.payouts ? data.condition.payouts.map(payout => new Big(payout)) : null,
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
      currentAnswerTimestamp: data.currentAnswerTimestamp ? bigNumberify(data.currentAnswerTimestamp) : null,
    },
    curatedByDxDao: data.curatedByDxDao,
    klerosTCRregistered: data.klerosTCRregistered,
    curatedByDxDaoOrKleros: data.curatedByDxDaoOrKleros,
    submissionIDs: data.submissionIDs,
  }
}

let needRefetch = false

/**
 * Get data from the graph for the given market maker. All the information returned by this hook comes from the graph,
 * other necessary information should be fetched from the blockchain.
 */
export const useGraphMarketMakerData = (networkId: number, myMarkets: boolean, marketMakerAddress?: string): Result => {
  const [marketMakerData, setMarketMakerData] = useState<Maybe<GraphMarketMakerDataCollection>>(null)
  const [needUpdate, setNeedUpdate] = useState<boolean>(false)
  const knownArbitrators = getArbitratorsByNetwork(networkId).map(x => x.address)
  const cpk = useCpk()

  const myMarketsQuery = buildQueryMyMarkets(
    Object.assign({}, DEFAULT_OPTIONS, {
      allData: true,
    }),
  )

  const requestQuery = myMarkets ? myMarketsQuery : query
  const requestVariables = myMarkets
    ? {
        account: cpk?.address.toLowerCase(),
        skip: 0,
        first: 4,
        knownArbitrators,
      }
    : { id: marketMakerAddress }

  const { data, error, loading, refetch } = useQuery<GraphResponse | GraphResponseAccountMarkets>(requestQuery, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: requestVariables,
  })

  useEffect(() => {
    setNeedUpdate(true)
  }, [marketMakerAddress])

  const isGraphResponse = (value: GraphResponse | GraphResponseAccountMarkets): value is GraphResponse => {
    return Object.prototype.hasOwnProperty.call(value, 'fixedProductMarketMaker')
  }

  useMemo(() => {
    if (data) {
      if (isGraphResponse(data)) {
        if (data && data.fixedProductMarketMaker && data.fixedProductMarketMaker.id === marketMakerAddress) {
          const rangledValue = wrangleResponse(data.fixedProductMarketMaker, networkId)
          if (needUpdate) {
            setMarketMakerData([rangledValue])
            setNeedUpdate(false)
          } else if (!isObjectEqual(marketMakerData, rangledValue)) {
            setMarketMakerData([rangledValue])
            needRefetch = false
          }
        }
      } else {
        if (data && data.account && data.account.fpmmParticipations) {
          const rangledValues = data.account.fpmmParticipations.map(fpmmParticipation => {
            return wrangleResponse(fpmmParticipation.fixedProductMarketMakers, networkId)
          })
          if (needUpdate) {
            setMarketMakerData(rangledValues)
            setNeedUpdate(false)
          } else if (!isObjectEqual(marketMakerData, rangledValues)) {
            setMarketMakerData(rangledValues)
            needRefetch = false
          }
        }
      }
    }
  }, [data])

  const fetchData = async () => {
    try {
      needRefetch = true
      let counter = 0
      await waitABit()
      while (needRefetch && counter < 15) {
        await refetch()
        await waitABit()
        counter += 1
      }
    } catch (error) {
      logger.log(error.message)
    }
  }

  return {
    fetchData,
    marketMakerData: error ? null : marketMakerData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
