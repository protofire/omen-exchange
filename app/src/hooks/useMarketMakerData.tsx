import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { ConnectedWeb3Context } from './connectedWeb3'
import { MarketMakerService } from '../services'
import { useContracts } from './useContracts'
import { getLogger } from '../util/logger'
import { BalanceItem, OutcomeSlot, Status, WinnerOutcome } from '../util/types'

const logger = getLogger('Market::useMarketMakerData')

export const useMarketMakerData = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): {
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  marketFunding: BigNumber
  balance: BalanceItem[]
  winnerOutcome: Maybe<WinnerOutcome>
  userPoolSharesPercentage: number
  status: Status
} => {
  const { conditionalTokens } = useContracts(context)

  const [totalPoolShares, setTotalPoolShares] = useState<BigNumber>(new BigNumber(0))
  const [userPoolShares, setUserPoolShares] = useState<BigNumber>(new BigNumber(0))
  const [marketFunding, setMarketFunding] = useState<BigNumber>(new BigNumber(0))
  const [balance, setBalance] = useState<BalanceItem[]>([])
  const [winnerOutcome, setWinnerOutcome] = useState<Maybe<WinnerOutcome>>(null)
  const [userPoolSharesPercentage, setUserPoolSharesPercentage] = useState<number>(0)
  const [status, setStatus] = useState<Status>(Status.Ready)

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

        const [userShares, marketMakerShares, actualPrices, marketMakerFunding] = await Promise.all(
          [
            marketMaker.getBalanceInformation(user),
            marketMaker.getBalanceInformation(marketMakerAddress),
            // TODO: calculate actual prices
            // marketMaker.getActualPrice(),
            { actualPriceForYes: 0.5, actualPriceForNo: 0.5 },
            marketMaker.getTotalSupply(),
          ],
        )

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

        const totalMarketMakerShares = marketMakerShares.balanceOfForNo.add(
          marketMakerShares.balanceOfForYes,
        )

        const totalUserShares = userShares.balanceOfForNo.add(userShares.balanceOfForYes)
        const totalUserSharesNumber = +ethers.utils.formatUnits(totalUserShares, 18)

        const totalShares = totalMarketMakerShares.add(totalUserShares)
        const totalSharesNumber = +ethers.utils.formatUnits(totalShares, 18)

        const userSharesPercentage =
          totalSharesNumber > 0 ? (totalUserSharesNumber / totalSharesNumber) * 100 : 0

        setTotalPoolShares(totalShares)
        setUserPoolShares(totalUserShares)
        setMarketFunding(marketMakerFunding)
        setBalance(balanceShares)
        setUserPoolSharesPercentage(userSharesPercentage)
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
  }, [marketMakerAddress, context, conditionalTokens])

  return {
    totalPoolShares,
    userPoolShares,
    marketFunding,
    balance,
    userPoolSharesPercentage,
    winnerOutcome,
    status,
  }
}
