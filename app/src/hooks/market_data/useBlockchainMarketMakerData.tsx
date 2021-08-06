import Big from 'big.js'
import { ethers } from 'ethers'
import { BigNumber, bigNumberify, solidityKeccak256 } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../../contexts'
import { ERC20Service, MarketMakerService, OracleService } from '../../services'
import { getLogger } from '../../util/logger'
import { getCallSig, multicall } from '../../util/multicall'
import { getArbitratorFromAddress } from '../../util/networks'
import { isScalarMarket } from '../../util/tools'
import { BalanceItem, MarketMakerData, Status } from '../../util/types'
import { GraphMarketMakerData } from '../graph/useGraphMarketMakerData'
import { useContracts } from '../useContracts'

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

    const { address: marketMakerAddress, arbitratorAddress, collateralAddress, conditionId } = graphMarketMakerData
    const conditionalTokensAddress = conditionalTokens.address
    const erc20 = new ERC20Service(provider, null, collateralAddress)

    // aggregate calls
    let calls = []

    // get collection ids
    for (let i = 0; i < outcomesLength; i++) {
      calls.push({
        target: conditionalTokensAddress,
        call: [
          getCallSig(contracts.conditionalTokens, 'getCollectionId'),
          ethers.constants.HashZero,
          conditionId,
          1 << i,
        ],
        returns: [[`collectionId-${i}`]],
      })
    }

    calls.push(
      // get collateral token information
      {
        target: collateralAddress,
        call: [getCallSig(erc20, 'decimals')],
        returns: [['decimals']],
      },
      {
        target: collateralAddress,
        call: [getCallSig(erc20, 'symbol')],
        returns: [['symbol']],
      },
      // get market maker total supply
      {
        target: marketMakerAddress,
        call: [getCallSig(marketMaker, 'totalSupply')],
        returns: [['totalPoolShares']],
      },
      // get market marker total earnings
      {
        target: marketMakerAddress,
        call: [getCallSig(marketMaker, 'collectedFees')],
        returns: [['totalEarnings']],
      },
      // get payout denominator to check if the condition is resolved
      {
        target: conditionalTokensAddress,
        call: [getCallSig(conditionalTokens, 'payoutDenominator'), conditionId],
        returns: [['payoutDenominator']],
      },
    )

    if (cpk && cpk.address) {
      calls.push(
        // get user shares
        {
          target: marketMakerAddress,
          call: [getCallSig(marketMaker, 'balanceOf'), cpk.address],
          returns: [['userPoolShares']],
        },
      )
    }

    if (isQuestionFinalized) {
      calls.push({
        target: realitio.address,
        call: [getCallSig(realitio, 'resultFor'), id],
        returns: [['realitioAnswer']],
      })
    }

    let response = await multicall(calls, networkId)

    // wrangle results
    let results = response.results.transformed
    const { decimals, payoutDenominator, symbol, totalEarnings, totalPoolShares } = results

    const userPoolShares = results.userPoolShares || new BigNumber(0)
    const realitioAnswer = results.realitioAnswer || null

    const collateral = {
      address: collateralAddress,
      symbol,
      decimals,
    }

    const isConditionResolved = !payoutDenominator.isZero()

    // second call, dependent on collectionIds
    calls = []
    for (let i = 0; i < outcomesLength; i++) {
      const collectionId = results[`collectionId-${i}`]
      const positionId = solidityKeccak256(['address', 'uint'], [collateralAddress, collectionId])
      calls.push({
        target: conditionalTokensAddress,
        call: [getCallSig(conditionalTokens, 'balanceOf'), marketMakerAddress, positionId],
        returns: [[`shares-${i}`]],
      })
      if (cpk && cpk.address) {
        calls.push({
          target: conditionalTokensAddress,
          call: [getCallSig(conditionalTokens, 'balanceOf'), cpk.address, positionId],
          returns: [[`user-${i}`]],
        })

        if (!userPoolShares.isZero()) {
          // get user earnings
          calls.push({
            target: marketMakerAddress,
            call: [getCallSig(marketMaker, 'feesWithdrawableBy'), cpk.address],
            returns: [['userEarnings']],
          })
        }
      }
    }

    response = await multicall(calls, networkId)
    results = response.results.transformed
    const marketMakerShares = []
    const userShares = []
    for (let i = 0; i < outcomesLength; i++) {
      marketMakerShares.push(results[`shares-${i}`])
      userShares.push(results[`user-${i}`] || new BigNumber(0))
    }

    const userEarnings = results.userEarnings || new BigNumber(0)

    const arbitrator = getArbitratorFromAddress(networkId, arbitratorAddress)

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
  }, [graphMarketMakerData, provider, contracts, networkId, cpk])

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
