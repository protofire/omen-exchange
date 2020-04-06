import { BigNumber, bigNumberify } from 'ethers/utils'
import { useCallback, useMemo, useState } from 'react'

import { CPKService, ERC20Service, MarketMakerService, OracleService } from '../services'
import { getLogger } from '../util/logger'
import { getArbitratorFromAddress } from '../util/networks'
import { BalanceItem, MarketMakerData, Status } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { usePolling } from './usePolling'

const logger = getLogger('Market::useMarketMakerData')

export const useMarketMakerData = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): { marketMakerData: MarketMakerData; status: Status } => {
  const { buildMarketMaker, conditionalTokens, realitio } = useContracts(context)
  const { account, library: provider, networkId } = context

  const [status, setStatus] = useState(Status.Ready)

  const initialMarketMakerData = useMemo(
    () => ({
      totalPoolShares: new BigNumber(0),
      userPoolShares: new BigNumber(0),
      balances: [],
      winnerOutcome: null,
      marketMakerFunding: new BigNumber(0),
      marketMakerUserFunding: new BigNumber(0),
      collateral: null,
      questionId: '',
      question: '',
      category: '',
      resolution: null,
      arbitrator: null,
      isQuestionFinalized: false,
      isConditionResolved: false,
      fee: null,
      userEarnings: new BigNumber(0),
      totalEarnings: new BigNumber(0),
      payouts: null,
    }),
    [],
  )

  const fetchFunc = useCallback(async () => {
    setStatus(status => (status === Status.Ready ? Status.Loading : Status.Refreshing))

    const marketMaker = buildMarketMaker(marketMakerAddress)

    const conditionId = await marketMaker.getConditionId()
    const isConditionResolved = await conditionalTokens.isConditionResolved(conditionId)

    const questionId = await conditionalTokens.getQuestionId(conditionId)
    const {
      arbitratorAddress,
      category,
      outcomes,
      question,
      questionTemplateId,
      resolution,
    } = await realitio.getQuestion(questionId)

    const arbitrator = getArbitratorFromAddress(networkId, arbitratorAddress)

    let cpk: Maybe<CPKService> = null
    if (account) {
      cpk = await CPKService.create(provider)
    }

    const [
      userShares,
      marketMakerShares,
      marketMakerFunding,
      marketMakerUserFunding,
      collateralAddress,
      totalPoolShares,
      userPoolShares,
      fee,
      isQuestionFinalized,
      userEarnings,
    ] = await Promise.all([
      cpk && cpk.address
        ? marketMaker.getBalanceInformation(cpk.address, outcomes.length)
        : outcomes.map(() => new BigNumber(0)),
      marketMaker.getBalanceInformation(marketMakerAddress, outcomes.length),
      marketMaker.getTotalSupply(),
      cpk && cpk.address ? marketMaker.balanceOf(cpk.address) : new BigNumber(0),
      marketMaker.getCollateralToken(),
      marketMaker.poolSharesTotalSupply(),
      cpk && cpk.address ? marketMaker.poolSharesBalanceOf(cpk.address) : new BigNumber(0),
      marketMaker.getFee(),
      realitio.isFinalized(questionId),
      cpk && cpk.address ? marketMaker.getFeesWithdrawableBy(cpk.address) : new BigNumber(0),
    ])

    const totalEarnings = await marketMaker.getCollectedFees()

    const realitioAnswer = isQuestionFinalized ? await realitio.getResultFor(questionId) : null
    const winnerOutcome = realitioAnswer ? bigNumberify(realitioAnswer).toNumber() : null
    const payouts = realitioAnswer
      ? OracleService.getPayouts(questionTemplateId, realitioAnswer, outcomes.length)
      : null

    const actualPrices = MarketMakerService.getActualPrice(marketMakerShares)

    const erc20Service = new ERC20Service(provider, account, collateralAddress)
    const collateral = await erc20Service.getProfileSummary()

    const balances: BalanceItem[] = outcomes.map((outcome: string, index: number) => {
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
        winningOutcome: winnerOutcome === index,
      }
    })

    setStatus(Status.Done)

    return {
      totalPoolShares,
      userPoolShares,
      balances,
      arbitrator,
      winnerOutcome,
      question,
      questionId,
      resolution,
      category,
      collateral,
      marketMakerFunding,
      marketMakerUserFunding,
      isQuestionFinalized,
      isConditionResolved,
      fee,
      userEarnings,
      totalEarnings,
      payouts,
    }
  }, [conditionalTokens, provider, networkId, account, marketMakerAddress, realitio, buildMarketMaker])

  const marketMakerData = usePolling<MarketMakerData>({
    fetchFunc,
    initialState: initialMarketMakerData,
    delay: 5000,
    onError: useCallback(error => {
      logger.error('There was an error fetching the market maker data:', error.message)
      setStatus(Status.Error)
    }, []),
  })

  return { marketMakerData, status }
}
