import React, { FC, useState, useEffect } from 'react'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FetchMarketService } from '../../services'
import { getLogger } from '../../util/logger'
import { Status, BalanceItems, OutcomeSlots } from '../../util/types'

const logger = getLogger('Market::MarketView')

const MarketViewContainer: FC = (props: any) => {
  const context = useConnectedWeb3Context()

  const [balance, setBalance] = useState<BalanceItems[]>([])
  const [address] = useState<string>(props.match.params.address)
  const [status, setStatus] = useState<Status>(Status.Ready)

  useEffect(() => {
    const fetchData = async () => {
      setStatus(Status.Loading)
      try {
        const networkId = context.networkId
        const provider = context.library
        const user = await provider.getSigner().getAddress()

        const fetchMarketService = new FetchMarketService(address, networkId, provider)
        const [balanceInformation, actualPrice] = await Promise.all([
          fetchMarketService.getBalanceInformation(user),
          fetchMarketService.getActualPrice(),
        ])
        const balance = [
          {
            outcomeName: OutcomeSlots.Yes,
            probability: actualPrice.actualPriceForYes * 100,
            currentPrice: actualPrice.actualPriceForYes,
            shares: balanceInformation.balanceOfForYes,
          },
          {
            outcomeName: OutcomeSlots.No,
            probability: actualPrice.actualPriceForNo * 100,
            currentPrice: actualPrice.actualPriceForNo,
            shares: balanceInformation.balanceOfForNo,
          },
        ]

        setBalance(balance)

        setStatus(Status.Done)
      } catch (error) {
        logger.error(error && error.message)
        setStatus(Status.Error)
      }
    }
    fetchData()
  }, [address, context])

  // TODO: fetch question and resolution date, and pass in props
  return (
    <MarketView
      status={status}
      question={'Will be X the president of X in 2020?'}
      resolution={new Date()}
      balance={balance}
    />
  )
}

export { MarketViewContainer }
