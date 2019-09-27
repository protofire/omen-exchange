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
    const fetchData = async () => {
      setStatus(Status.Loading)
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

        setStatus(Status.Done)
        setFunding(marketFunding)
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
      marketAddress={address}
      funding={funding}
    />
  )
}

export { MarketViewContainer }
