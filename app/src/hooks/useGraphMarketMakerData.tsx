import { useQuery } from '@apollo/react-hooks'
import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getLogger } from '../util/logger'
import { getOutcomes } from '../util/networks'
import { isObjectEqual, waitABit } from '../util/tools'
import { AnswerItem, BondItem, INVALID_ANSWER_ID, KlerosSubmission, Question, Status } from '../util/types'

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
      currentAnswerTimestamp
      currentAnswerBond
      answerFinalizedTimestamp
      scaledLiquidityParameter
      runningDailyVolumeByHour
      isPendingArbitration
      arbitrationOccurred
      runningDailyVolumeByHour
      curatedByDxDao
      curatedByDxDaoOrKleros
      question {
        id
        data
        answers {
          answer
          bondAggregate
        }
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
  currentAnswerBond: Maybe<BigNumber>
  runningDailyVolumeByHour: BigNumber[]
  question: {
    id: string
    data: string
    answers: {
      answer: string
      bondAggregate: BigNumber
    }[]
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

type Result = {
  fetchData: () => Promise<void>
  marketMakerData: Maybe<GraphMarketMakerData>
  status: Status
}

const getBondedItems = (outcomes: string[], answers: AnswerItem[]): BondItem[] => {
  const bondedItems: BondItem[] = outcomes.map((outcome: string, index: number) => {
    const answer = answers.find(
      answer => answer.answer !== INVALID_ANSWER_ID && new BigNumber(answer.answer).toNumber() === index,
    )
    if (answer) {
      return {
        outcomeName: outcome,
        bondedEth: new BigNumber(answer.bondAggregate),
      } as BondItem
    }
    return {
      outcomeName: outcome,
      bondedEth: new BigNumber(0),
    }
  })

  const invalidAnswer = answers.find(answer => answer.answer === INVALID_ANSWER_ID)

  bondedItems.push({
    outcomeName: 'Invalid',
    bondedEth: invalidAnswer ? new BigNumber(invalidAnswer.bondAggregate) : new BigNumber(0),
  })

  // add invalid outcome

  return bondedItems
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
      currentAnswerBond: data.currentAnswerBond,
      answers: data.question.answers,
      bonds: getBondedItems(outcomes, data.question.answers),
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
export const useGraphMarketMakerData = (marketMakerAddress: string, networkId: number): Result => {
  const [marketMakerData, setMarketMakerData] = useState<Maybe<GraphMarketMakerData>>(null)
  const [needUpdate, setNeedUpdate] = useState<boolean>(false)

  const { data, error, loading, refetch } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { id: marketMakerAddress },
  })

  useEffect(() => {
    setNeedUpdate(true)
  }, [marketMakerAddress])

  if (data && data.fixedProductMarketMaker && data.fixedProductMarketMaker.id === marketMakerAddress) {
    const rangledValue = wrangleResponse(data.fixedProductMarketMaker, networkId)
    if (needUpdate) {
      setMarketMakerData(rangledValue)
      setNeedUpdate(false)
    } else if (!isObjectEqual(marketMakerData, rangledValue)) {
      setMarketMakerData(rangledValue)
      needRefetch = false
    }
  }

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
