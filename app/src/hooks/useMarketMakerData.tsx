import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

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
  userPoolSharesPercentage: number
  balance: BalanceItem[]
  winnerOutcome: Maybe<WinnerOutcome>
  status: Status
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  marketMakerFundingPercentage: number
  collateral: Maybe<Token>
} => {
  const { conditionalTokens } = useContracts(context)

  const [totalPoolShares, setTotalPoolShares] = useState<BigNumber>(new BigNumber(0))
  const [userPoolShares, setUserPoolShares] = useState<BigNumber>(new BigNumber(0))
  const [balance, setBalance] = useState<BalanceItem[]>([])
  const [winnerOutcome, setWinnerOutcome] = useState<Maybe<WinnerOutcome>>(null)
  const [userPoolSharesPercentage, setUserPoolSharesPercentage] = useState<number>(0)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [marketMakerFunding, setMarketMakerFunding] = useState<BigNumber>(new BigNumber(0))
  const [marketMakerUserFunding, setMarketMakerUserFunding] = useState<BigNumber>(new BigNumber(0))
  const [marketMakerFundingPercentage, setMarketMakerFundingPercentage] = useState<number>(0)
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

        const actualPrices = await marketMaker.getActualPrice(marketMakerShares)

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

        const totalMarketMakerShares = marketMakerShares.balanceOfForNo.add(
          marketMakerShares.balanceOfForYes,
        )

        const totalUserShares = userShares.balanceOfForNo.add(userShares.balanceOfForYes)
        const totalUserSharesNumber = +ethers.utils.formatUnits(totalUserShares, token.decimals)

        const totalShares = totalMarketMakerShares.add(totalUserShares)
        const totalSharesNumber = +ethers.utils.formatUnits(totalShares, token.decimals)

        const userSharesPercentage =
          totalSharesNumber > 0 ? (totalUserSharesNumber / totalSharesNumber) * 100 : 0

        const marketMakerFundingNumber = +ethers.utils.formatUnits(marketMakerFund, token.decimals)
        const marketMakerUserFundingNumber = +ethers.utils.formatUnits(
          marketMakerUserFund,
          token.decimals,
        )
        const marketMakerFundPercentage =
          marketMakerFundingNumber > 0
            ? (marketMakerUserFundingNumber / marketMakerFundingNumber) * 100
            : 0

        setTotalPoolShares(totalShares)
        setUserPoolShares(totalUserShares)
        setUserPoolSharesPercentage(userSharesPercentage)

        setMarketMakerFunding(marketMakerFund)
        setMarketMakerUserFunding(marketMakerUserFund)
        setMarketMakerFundingPercentage(marketMakerFundPercentage)

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
    userPoolSharesPercentage,
    balance,
    winnerOutcome,
    status,
    marketMakerFunding,
    marketMakerUserFunding,
    marketMakerFundingPercentage,
    collateral,
  }
}
