import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers/utils'

import { ConnectedWeb3Context } from './connectedWeb3'
import { MarketMakerService } from '../services'
import { getTokenFromAddress } from '../util/addresses'
import { useContracts } from './useContracts'
import { getLogger } from '../util/logger'
import { BalanceItem, OutcomeSlot, Status, WinnerOutcome, Token } from '../util/types'

const logger = getLogger('Market::useMarketMakerData')

export const useMarketMakerData = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): {
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  balance: BalanceItem[]
  winnerOutcome: Maybe<WinnerOutcome>
  status: Status
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  collateral: Maybe<Token>
} => {
  const { conditionalTokens } = useContracts(context)

  const [totalPoolShares, setTotalPoolShares] = useState<BigNumber>(new BigNumber(0))
  const [userPoolShares, setUserPoolShares] = useState<BigNumber>(new BigNumber(0))
  const [balance, setBalance] = useState<BalanceItem[]>([])
  const [winnerOutcome, setWinnerOutcome] = useState<Maybe<WinnerOutcome>>(null)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [marketMakerFunding, setMarketMakerFunding] = useState<BigNumber>(new BigNumber(0))
  const [marketMakerUserFunding, setMarketMakerUserFunding] = useState<BigNumber>(new BigNumber(0))
  const [collateral, setCollateral] = useState<Maybe<Token>>(null)

  useEffect(() => {
    const fetchMarketMakerData = async ({ enableStatus }: { enableStatus: boolean }) => {
      try {
        enableStatus && setStatus(Status.Loading)
        const provider = context.library
        const user = await provider.getSigner().getAddress()

        const marketMaker = new MarketMakerService(marketMakerAddress, conditionalTokens, provider)

        const conditionId = await marketMaker.getConditionId()
        const isConditionResolved = await conditionalTokens.isConditionResolved(conditionId)

        const winnerOutcomeData = isConditionResolved
          ? await conditionalTokens.getWinnerOutcome(conditionId)
          : null
        setWinnerOutcome(winnerOutcomeData)

        const [
          userShares,
          marketMakerShares,
          marketMakerFund,
          marketMakerUserFund,
          collateralAddress,
        ] = await Promise.all([
          marketMaker.getBalanceInformation(user),
          marketMaker.getBalanceInformation(marketMakerAddress),
          marketMaker.getTotalSupply(),
          marketMaker.balanceOf(user),
          marketMaker.getCollateralToken(),
        ])

        const actualPrices = MarketMakerService.getActualPrice(marketMakerShares)

        const token = getTokenFromAddress(context.networkId, collateralAddress)
        setCollateral(token)

        const probabilityForYes = actualPrices.actualPriceForYes * 100
        const probabilityForNo = actualPrices.actualPriceForNo * 100

        const balanceShares = [
          {
            outcomeName: OutcomeSlot.Yes,
            probability: Math.round((probabilityForYes / 100) * 100),
            currentPrice: actualPrices.actualPriceForYes,
            shares: userShares.balanceOfForYes,
            holdings: marketMakerShares.balanceOfForYes,
            winningOutcome: winnerOutcome === WinnerOutcome.Yes,
          },
          {
            outcomeName: OutcomeSlot.No,
            probability: Math.round((probabilityForNo / 100) * 100),
            currentPrice: actualPrices.actualPriceForNo,
            shares: userShares.balanceOfForNo,
            holdings: marketMakerShares.balanceOfForNo,
            winningOutcome: winnerOutcome === WinnerOutcome.No,
          },
        ]

        const poolSharesTotalSupply = await marketMaker.poolSharesTotalSupply()
        const userPoolShares = await marketMaker.poolSharesBalanceOf(user)

        setTotalPoolShares(poolSharesTotalSupply)
        setUserPoolShares(userPoolShares)

        setMarketMakerFunding(marketMakerFund)
        setMarketMakerUserFunding(marketMakerUserFund)

        setBalance(balanceShares)

        enableStatus && setStatus(Status.Done)
      } catch (error) {
        logger.error('There was an error fetching the market maker data:', error.message)
        enableStatus && setStatus(Status.Error)
      }
    }

    fetchMarketMakerData({ enableStatus: true })

    const intervalId = setInterval(() => {
      fetchMarketMakerData({ enableStatus: false })
    }, 2000)

    return () => clearInterval(intervalId)
  }, [marketMakerAddress, context, conditionalTokens, winnerOutcome])

  return {
    totalPoolShares,
    userPoolShares,
    balance,
    winnerOutcome,
    status,
    marketMakerFunding,
    marketMakerUserFunding,
    collateral,
  }
}
