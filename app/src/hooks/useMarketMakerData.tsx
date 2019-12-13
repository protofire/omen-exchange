import { useCallback, useMemo, useState } from 'react'
import { BigNumber } from 'ethers/utils'

import { usePolling } from './usePolling'
import { ConnectedWeb3Context } from './connectedWeb3'
import { ERC20Service, MarketMakerService } from '../services'
import { getArbitratorFromAddress } from '../util/addresses'
import { useContracts } from './useContracts'
import { getLogger } from '../util/logger'
import { BalanceItem, Status, Token, Arbitrator } from '../util/types'

const logger = getLogger('Market::useMarketMakerData')

interface MarketMakerData {
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  balances: BalanceItem[]
  winnerOutcome: Maybe<number>
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  collateral: Maybe<Token>
  question: string
  questionId: string
  category: string
  resolution: Maybe<Date>
  arbitrator: Maybe<Arbitrator>
  isConditionResolved: boolean
  fee: Maybe<BigNumber>
  isQuestionFinalized: boolean
}

export const useMarketMakerData = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): { marketMakerData: MarketMakerData; status: Status } => {
  const { conditionalTokens, realitio, buildMarketMaker } = useContracts(context)

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
    }),
    [],
  )

  const fetchFunc = useCallback(async () => {
    setStatus(status => (status === Status.Ready ? Status.Loading : Status.Refreshing))
    const provider = context.library
    const user = await provider.getSigner().getAddress()

    const marketMaker = buildMarketMaker(marketMakerAddress)

    const conditionId = await marketMaker.getConditionId()
    const isConditionResolved = await conditionalTokens.isConditionResolved(conditionId)

    const questionId = await conditionalTokens.getQuestionId(conditionId)
    const {
      question,
      resolution,
      arbitratorAddress,
      category,
      outcomes,
    } = await realitio.getQuestion(questionId)

    const arbitrator = getArbitratorFromAddress(context.networkId, arbitratorAddress)

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
    ] = await Promise.all([
      marketMaker.getBalanceInformationWithMultipleOutcomes(user, outcomes.length),
      marketMaker.getBalanceInformationWithMultipleOutcomes(marketMakerAddress, outcomes.length),
      marketMaker.getTotalSupply(),
      marketMaker.balanceOf(user),
      marketMaker.getCollateralToken(),
      marketMaker.poolSharesTotalSupply(),
      marketMaker.poolSharesBalanceOf(user),
      marketMaker.getFee(),
      realitio.isFinalized(questionId),
    ])

    const winnerOutcome = isQuestionFinalized ? await realitio.getWinnerOutcome(questionId) : null

    const actualPrices = MarketMakerService.getActualPriceWithHoldings(marketMakerShares)

    const erc20Service = new ERC20Service(provider, collateralAddress)
    const collateral = await erc20Service.getProfileSummary()

    const balances: BalanceItem[] = outcomes.map((outcome: string, index: number) => {
      const outcomeName = outcome
      const probabilityForPrice = actualPrices[index] * 100
      const probability = Math.round((probabilityForPrice / 100) * 100)
      const currentPrice = actualPrices[index]
      const shares = userShares[index]
      const holdings = marketMakerShares[index]

      return {
        outcomeName,
        probability,
        currentPrice,
        shares,
        holdings,
        winningOutcome: false, // TODO: fix this, how to know the winningOutcome with multiple outcomes ?
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
    }
  }, [
    conditionalTokens,
    context.library,
    context.networkId,
    marketMakerAddress,
    realitio,
    buildMarketMaker,
  ])

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
