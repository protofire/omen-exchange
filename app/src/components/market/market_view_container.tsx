import React, { FC, useState, useEffect } from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FetchMarketService } from '../../services'
import { getLogger } from '../../util/logger'

enum Status {
  Ready = 'Ready',
  Loading = 'Loading',
  Done = 'Done',
  Error = 'Error',
}

const logger = getLogger('Market::MarketView')

const MarketViewContainer: FC = (props: any) => {
  const context = useConnectedWeb3Context()

  const [data, setData] = useState({
    marketInformation: [],
    balanceInformation: [],
    actualPrice: [],
  })

  const [address] = useState(props.match.params.address)
  const [status, setStatus] = useState(Status.Ready)

  useEffect(() => {
    const fetchData = async () => {
      setStatus(Status.Loading)
      try {
        const networkId = context.networkId
        const provider = context.library
        const user = await provider.getSigner().getAddress()

        const fetchMarketService = new FetchMarketService(address, networkId, provider)
        const [marketInformation, balanceInformation, actualPrice] = await Promise.all([
          fetchMarketService.getMarketInformation(),
          fetchMarketService.getBalanceInformation(user),
          fetchMarketService.getActualPrice(),
        ])

        setData({
          marketInformation,
          balanceInformation,
          actualPrice,
        })

        setStatus(Status.Done)
      } catch (error) {
        logger.error(error && error.message)
        setStatus(Status.Error)
      }
    }
    fetchData()
  }, [address, context])

  return (
    <>
      <p>Status: {status}</p>
      <p>Question: TODO</p>
      <p>Resolution date: TODO</p>

      <p>{JSON.stringify(data.marketInformation)}</p>
      <p>{JSON.stringify(data.balanceInformation)}</p>
      <p>{JSON.stringify(data.actualPrice)}</p>
    </>
  )
}

export { MarketViewContainer }
