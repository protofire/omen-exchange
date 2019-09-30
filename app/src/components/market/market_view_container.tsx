import React, { FC, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

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
  const [funding, setFunding] = useState<BigNumber>(ethers.constants.Zero)

  useEffect(() => {
    const fetchData = async ({ enableStatus }: any) => {
      enableStatus && setStatus(Status.Loading)
      try {
        const networkId = context.networkId
        const provider = context.library
        const user = await provider.getSigner().getAddress()

        const fetchMarketService = new FetchMarketService(address, networkId, provider)
        const [
          balanceInformation,
          marketBalanceInformation,
          actualPrice,
          marketFunding,
        ] = await Promise.all([
          fetchMarketService.getBalanceInformation(user),
          fetchMarketService.getBalanceInformation(address),
          fetchMarketService.getActualPrice(),
          fetchMarketService.getFunding(),
        ])

        const probabilityForYes = actualPrice.actualPriceForYes * 100
        const probabilityForNo = actualPrice.actualPriceForNo * 100

        const balance = [
          {
            outcomeName: OutcomeSlots.Yes,
            probability: Math.round((probabilityForYes / 100) * 100),
            currentPrice: actualPrice.actualPriceForYes,
            shares: balanceInformation.balanceOfForYes,
            holdings: marketBalanceInformation.balanceOfForYes,
          },
          {
            outcomeName: OutcomeSlots.No,
            probability: Math.round((probabilityForNo / 100) * 100),
            currentPrice: actualPrice.actualPriceForNo,
            shares: balanceInformation.balanceOfForNo,
            holdings: marketBalanceInformation.balanceOfForNo,
          },
        ]

        setBalance(balance)
        setFunding(marketFunding)

        enableStatus && setStatus(Status.Done)
      } catch (error) {
        logger.error(error && error.message)
        enableStatus && setStatus(Status.Error)
      }
    }

    fetchData({ enableStatus: true })

    const intervalId = setInterval(() => {
      fetchData({ enableStatus: false })
    }, 2000)

    return () => clearInterval(intervalId)
  }, [address, context])

  // TODO: fetch question and resolution date, and pass in props
  return (
    <MarketView
      balance={balance}
      funding={funding}
      marketAddress={address}
      question={'Will be X the president of X in 2020?'}
      resolution={new Date(2019, 10, 30)}
      status={status}
    />
  )
}

export { MarketViewContainer }
