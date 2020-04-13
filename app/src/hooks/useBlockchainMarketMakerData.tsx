import { BigNumber } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'

import { CPKService, ERC20Service, MarketMakerService } from '../services'
import { getLogger } from '../util/logger'
import { getArbitratorFromAddress } from '../util/networks'
import { promiseProps } from '../util/tools'
import { BalanceItem, MarketMakerData, Status, Token } from '../util/types'

import { useConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { GraphMarketMakerData } from './useGraphMarketMakerData'

const logger = getLogger('useBlockchainMarketMakerData')

const getBalances = (outcomes: string[], marketMakerShares: BigNumber[], userShares: BigNumber[]): BalanceItem[] => {
  const actualPrices = MarketMakerService.getActualPrice(marketMakerShares)

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
    }
  })

  return balances
}

export const getERC20Token = async (provider: any, address: string): Promise<Token> => {
  const erc20Service = new ERC20Service(provider, null, address)
  const token = await erc20Service.getProfileSummary()

  return token
}

export const useBlockchainMarketMakerData = (graphMarketMakerData: Maybe<GraphMarketMakerData>, networkId: number) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const contracts = useContracts(context)
  const [marketMakerData, setMarketMakerData] = useState<Maybe<MarketMakerData>>(null)
  const [status, setStatus] = useState<Status>(Status.Loading)

  const doFetchData = useCallback(async () => {
    if (!graphMarketMakerData) {
      return
    }

    const { buildMarketMaker, conditionalTokens } = contracts

    const marketMaker = buildMarketMaker(graphMarketMakerData.address)

    let cpk: Maybe<CPKService> = null
    if (account) {
      cpk = await CPKService.create(provider)
    }

    const { outcomes } = graphMarketMakerData.question

    const isQuestionFinalized = !!graphMarketMakerData.answerFinalizedTimestamp
    const {
      collateral,
      isConditionResolved,
      marketMakerFunding,
      marketMakerShares,
      marketMakerUserFunding,
      totalEarnings,
      totalPoolShares,
      userEarnings,
      userPoolShares,
      userShares,
    } = await promiseProps({
      marketMakerShares: marketMaker.getBalanceInformation(graphMarketMakerData.address, outcomes.length),
      userShares:
        cpk && cpk.address
          ? marketMaker.getBalanceInformation(cpk.address, outcomes.length)
          : outcomes.map(() => new BigNumber(0)),
      collateral: getERC20Token(provider, graphMarketMakerData.collateralAddress),
      isConditionResolved: conditionalTokens.isConditionResolved(graphMarketMakerData.conditionId),
      marketMakerFunding: marketMaker.getTotalSupply(),
      marketMakerUserFunding: cpk && cpk.address ? marketMaker.balanceOf(cpk.address) : new BigNumber(0),
      totalEarnings: marketMaker.getCollectedFees(),
      totalPoolShares: marketMaker.poolSharesTotalSupply(),
      userEarnings: cpk && cpk.address ? marketMaker.getFeesWithdrawableBy(cpk.address) : new BigNumber(0),
      userPoolShares: cpk && cpk.address ? marketMaker.poolSharesBalanceOf(cpk.address) : new BigNumber(0),
    })

    const arbitrator = getArbitratorFromAddress(networkId, graphMarketMakerData.arbitratorAddress)
    const balances = getBalances(outcomes, marketMakerShares, userShares)

    const newMarketMakerData: MarketMakerData = {
      address: graphMarketMakerData.address,
      arbitrator,
      balances,
      collateral,
      fee: graphMarketMakerData.fee,
      isConditionResolved,
      isQuestionFinalized,
      marketMakerFunding,
      marketMakerUserFunding,
      payouts: graphMarketMakerData.payouts,
      question: graphMarketMakerData.question,
      totalEarnings,
      totalPoolShares,
      userEarnings,
      userPoolShares,
    }

    setMarketMakerData(newMarketMakerData)
    setStatus(Status.Ready)
  }, [graphMarketMakerData, account, provider, contracts, networkId])

  const fetchData = useCallback(async () => {
    try {
      await doFetchData()
    } catch (e) {
      logger.error(e.message)
      setStatus(Status.Error)
    }
  }, [doFetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    fetchData,
    marketMakerData,
    status,
  }
}
