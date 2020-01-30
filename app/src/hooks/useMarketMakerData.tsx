import { useCallback, useMemo, useState } from 'react'
import { BigNumber } from 'ethers/utils'

import { usePolling } from './usePolling'
import { ConnectedWeb3Context } from './connectedWeb3'
import { CPKService, ERC20Service, MarketMakerService } from '../services'
import { getArbitratorFromAddress } from '../util/networks'
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
  const { library: provider, networkId, account } = context

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
    ])

    const winnerOutcome = isQuestionFinalized ? await realitio.getWinnerOutcome(questionId) : null

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
    }
  }, [
    conditionalTokens,
    provider,
    networkId,
    account,
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
