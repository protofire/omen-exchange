import { aggregate } from '@makerdao/multicall'
import configs from '@makerdao/multicall/src/addresses.json'
import Big from 'big.js'
import { ethers } from 'ethers'
import { BigNumber, bigNumberify } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'

import { ERC20Service, MarketMakerService, OracleService } from '../services'
import { getLogger } from '../util/logger'
import { getArbitratorFromAddress, getInfuraUrl, networkNames } from '../util/networks'
import { isScalarMarket } from '../util/tools'
import { BalanceItem, MarketMakerData, Status } from '../util/types'

import { useConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { GraphMarketMakerData } from './useGraphMarketMakerData'

const logger = getLogger('useBlockchainMarketMakerData')

const getBalances = (
  outcomes: string[],
  marketMakerShares: BigNumber[],
  userShares: BigNumber[],
  payouts: Maybe<Big[]>,
): BalanceItem[] => {
  const actualPrices = MarketMakerService.getActualPrice(marketMakerShares)

  const balances: BalanceItem[] = outcomes.length
    ? outcomes.map((outcome: string, index: number) => {
        const outcomeName = outcome
        const probability = actualPrices[index] * 100
        const currentPrice = actualPrices[index]
        const shares = userShares[index]
        const holdings = marketMakerShares[index]

        return {
          outcomeName,
          probability,
          currentPrice,
          shares,
          holdings,
          payout: payouts ? payouts[index] : new Big(0),
        }
      })
    : []

  return balances
}

const getScalarBalances = (
  marketMakerShares: BigNumber[],
  userShares: BigNumber[],
  payouts: Maybe<Big[]>,
): BalanceItem[] => {
  const actualPrices = MarketMakerService.getActualPrice(marketMakerShares)

  const balances: BalanceItem[] = []

  for (let i = 0; i < 2; i++) {
    const outcomeName = i === 0 ? 'short' : 'long'
    const probability = actualPrices[i] * 100
    const currentPrice = actualPrices[i]
    const shares = userShares[i]
    const holdings = marketMakerShares[i]

    const balance = {
      outcomeName,
      probability,
      currentPrice,
      shares,
      holdings,
      payout: payouts ? payouts[i] : new Big(0),
    }

    balances.push(balance)
  }

  return balances
}

export const useBlockchainMarketMakerData = (graphMarketMakerData: Maybe<GraphMarketMakerData>, networkId: number) => {
  const context = useConnectedWeb3Context()

  const { cpk, library: provider } = context
  const contracts = useContracts(context)
  const [marketMakerData, setMarketMakerData] = useState<Maybe<MarketMakerData>>(null)
  const [status, setStatus] = useState<Status>(Status.Loading)

  const doFetchData = useCallback(async () => {
    if (!graphMarketMakerData) {
      setStatus(Status.Error)
      return
    }

    const { buildMarketMaker, conditionalTokens, realitio } = contracts

    const marketMaker = buildMarketMaker(graphMarketMakerData.address)

    const { id, outcomes } = graphMarketMakerData.question

    const isQuestionFinalized = graphMarketMakerData.answerFinalizedTimestamp
      ? Date.now() > 1000 * graphMarketMakerData.answerFinalizedTimestamp.toNumber()
      : false

    const isScalar = isScalarMarket(graphMarketMakerData.oracle || '', networkId || 0)

    const outcomesLength = isScalar ? 2 : outcomes.length

    const getSig = (contract: any, fn: string) =>
      `${contract.contract.interface.functions[fn].signature}(${contract.contract.interface.functions[fn].outputs.map(
        (output: any) => output.type,
      )})`

    const network = (networkNames as any)[context.networkId]
    const config = {
      rpcUrl: getInfuraUrl(context.networkId),
      multicallAddress: (configs as any)[network.toLowerCase()].multicall,
    }

    const { address: marketMakerAddress, collateralAddress } = graphMarketMakerData
    const conditionalTokensAddress = conditionalTokens.address
    const erc20 = new ERC20Service(provider, null, collateralAddress)

    // first level of calls
    let calls = []

    // get collection ids
    for (let i = 0; i < outcomesLength; i++) {
      calls.push({
        target: conditionalTokensAddress,
        call: [
          getSig(contracts.conditionalTokens, 'getCollectionId'),
          ethers.constants.HashZero,
          graphMarketMakerData.conditionId,
          1 << i,
        ],
        returns: [[`collectionId-${i}`]],
      })
    }

    calls.push(
      // get collateral token information
      {
        target: collateralAddress,
        call: [getSig(erc20, 'decimals')],
        returns: [['decimals']],
      },
      {
        target: collateralAddress,
        call: [getSig(erc20, 'symbol')],
        returns: [['symbol']],
      },
      // get market maker funding
      {
        target: marketMakerAddress,
        call: [getSig(marketMaker, 'totalSupply')],
        returns: [['totalPoolShares']],
      },
      // get total earnings
      {
        target: marketMakerAddress,
        call: [getSig(marketMaker, 'collectedFees')],
        returns: [['totalEarnings']],
      },
      // get total pool shares
      {
        target: marketMakerAddress,
        call: [getSig(marketMaker, 'collectedFees')],
        returns: [['totalEarnings']],
      },
      // check if the condition resolved
      {
        target: conditionalTokensAddress,
        call: [getSig(conditionalTokens, 'payoutDenominator'), graphMarketMakerData.conditionId],
        returns: [['payoutDenominator']],
      },
    )

    if (cpk && cpk.address) {
      // get user market maker funding
      calls.push(
        {
          target: marketMakerAddress,
          call: [getSig(marketMaker, 'balanceOf'), cpk.address],
          returns: [['userPoolShares']],
        },
        {
          target: marketMakerAddress,
          call: [getSig(marketMaker, 'feesWithdrawableBy'), cpk.address],
          returns: [['userEarnings']],
        },
      )
    }

    if (isQuestionFinalized) {
      calls.push({
        target: realitio.address,
        call: [getSig(realitio, 'resultFor'), id],
        returns: [['realitioAnswer']],
      })
    }

    let response = await aggregate(calls, config)

    // wrangle first results
    const { decimals, payoutDenominator, symbol, totalEarnings, totalPoolShares } = response.results.transformed

    const userPoolShares = response.results.transformed.userPoolShares || new BigNumber(0)
    const realitioAnswer = response.results.transformed.realitioAnswer || null
    const userEarnings = response.results.transformed.userEarnings

    const collateral = {
      address: graphMarketMakerData.collateralAddress,
      symbol,
      decimals,
    }

    const isConditionResolved = !payoutDenominator.isZero()

    // second level of dependence
    calls = []
    for (let i = 0; i < outcomesLength; i++) {
      const collectionId = response.results.transformed[`collectionId-${i}`]
      calls.push({
        target: conditionalTokensAddress,
        call: [getSig(conditionalTokens, 'getPositionId'), collateralAddress, collectionId],
        returns: [[`positionId-${i}`]],
      })
    }
    response = await aggregate(calls, config)

    // third level of dependence
    calls = []
    for (let i = 0; i < outcomesLength; i++) {
      const positionId = response.results.transformed[`positionId-${i}`]
      calls.push({
        target: conditionalTokensAddress,
        call: [getSig(conditionalTokens, 'balanceOf'), marketMakerAddress, positionId],
        returns: [[`shares-${i}`]],
      })
      if (cpk && cpk.address) {
        calls.push({
          target: conditionalTokensAddress,
          call: [getSig(conditionalTokens, 'balanceOf'), cpk.address, positionId],
          returns: [[`user-${i}`]],
        })
      }
    }

    response = await aggregate(calls, config)

    const marketMakerShares = []
    const userShares = []
    for (let i = 0; i < outcomesLength; i++) {
      marketMakerShares.push(response.results.transformed[`shares-${i}`])
      userShares.push(response.results.transformed[`user-${i}`] || new BigNumber(0))
    }

    const arbitrator = getArbitratorFromAddress(networkId, graphMarketMakerData.arbitratorAddress)

    const payouts = graphMarketMakerData.payouts
      ? graphMarketMakerData.payouts
      : isScalar
      ? null
      : realitioAnswer
      ? OracleService.getPayouts(graphMarketMakerData.question.templateId, realitioAnswer, outcomesLength)
      : null

    let balances: BalanceItem[]
    isScalar
      ? (balances = getScalarBalances(marketMakerShares, userShares, payouts))
      : (balances = getBalances(outcomes, marketMakerShares, userShares, payouts))

    const newMarketMakerData: MarketMakerData = {
      address: graphMarketMakerData.address,
      answerFinalizedTimestamp: graphMarketMakerData.answerFinalizedTimestamp,
      arbitrator,
      balances,
      collateral,
      creator: graphMarketMakerData.creator,
      fee: graphMarketMakerData.fee,
      collateralVolume: graphMarketMakerData.collateralVolume,
      userInputCollateral: collateral,
      isConditionResolved,
      isQuestionFinalized,
      payouts,
      oracle: graphMarketMakerData.oracle,
      question: graphMarketMakerData.question,
      realitioAnswer: realitioAnswer ? bigNumberify(realitioAnswer) : null,
      totalEarnings,
      totalPoolShares,
      userEarnings,
      userPoolShares,
      klerosTCRregistered: graphMarketMakerData.klerosTCRregistered,
      curatedByDxDao: graphMarketMakerData.curatedByDxDao,
      curatedByDxDaoOrKleros: graphMarketMakerData.curatedByDxDaoOrKleros,
      runningDailyVolumeByHour: graphMarketMakerData.runningDailyVolumeByHour,
      lastActiveDay: graphMarketMakerData.lastActiveDay,
      creationTimestamp: graphMarketMakerData.creationTimestamp,
      scaledLiquidityParameter: graphMarketMakerData.scaledLiquidityParameter,
      submissionIDs: graphMarketMakerData.submissionIDs,
      scalarLow: graphMarketMakerData.scalarLow,
      scalarHigh: graphMarketMakerData.scalarHigh,
      outcomeTokenMarginalPrices: graphMarketMakerData.outcomeTokenMarginalPrices,
      outcomeTokenAmounts: graphMarketMakerData.outcomeTokenAmounts,
    }

    setMarketMakerData(newMarketMakerData)
    setStatus(Status.Ready)
  }, [graphMarketMakerData, provider, contracts, networkId, cpk, context.networkId])

  const fetchData = useCallback(async () => {
    try {
      setStatus(Status.Loading)
      await doFetchData()
    } catch (e) {
      logger.error(e)
      setStatus(Status.Error)
    }
  }, [doFetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (marketMakerData) {
      fetchData()
    }
    // eslint-disable-next-line
  }, [graphMarketMakerData])

  return {
    fetchData,
    marketMakerData,
    status,
  }
}
