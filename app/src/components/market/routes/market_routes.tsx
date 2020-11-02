import { useInterval } from '@react-corekit/use-interval'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'

import { FETCH_DETAILS_INTERVAL, MAX_MARKET_FEE } from '../../../common/constants'
import { useCheckContractExists, useMarketMakerData } from '../../../hooks'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { MarketDetailsPage } from '../../../pages'
import { getLogger } from '../../../util/logger'
import { isAddress } from '../../../util/tools'
import { ThreeBoxComments } from '../../comments'
import { SectionTitle } from '../../common'
import { InlineLoading } from '../../loading'
import { MarketNotFound } from '../sections/market_not_found'

const logger = getLogger('Market::Routes')

interface RouteParams {
  address: string
}

interface Props {
  marketMakerAddress: string
}

const MarketValidation: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  // Validate contract REALLY exists
  const contractExists = useCheckContractExists(marketMakerAddress, context)
  const { fetchData, marketMakerData } = useMarketMakerData(marketMakerAddress.toLowerCase())
  useInterval(fetchData, FETCH_DETAILS_INTERVAL)
  if (!contractExists) {
    logger.log(`Market address not found`)
    return <MarketNotFound />
  }

  if (!marketMakerData) {
    return <InlineLoading />
  }
  const { fee } = marketMakerData

  // Validate Markets with wrong FEE
  const feeBN = ethers.utils.parseEther('' + MAX_MARKET_FEE / Math.pow(10, 2))
  const zeroBN = new BigNumber(0)
  if (!(fee.gte(zeroBN) && fee.lte(feeBN))) {
    logger.log(`Market was not created with this app (different fee)`)
    return <SectionTitle title={'Invalid market'} />
  }

  return (
    <>
      <MarketDetailsPage {...props} fetchMarketMakerData={fetchData} marketMakerData={marketMakerData} />
      <ThreeBoxComments threadName={marketMakerAddress} />
    </>
  )
}

const MarketRoutes = (props: RouteComponentProps<RouteParams>) => {
  const marketMakerAddress = props.match.params.address
  if (!isAddress(marketMakerAddress)) {
    logger.log(`Contract address not valid`)
    return <Redirect to="/" />
  }

  return <MarketValidation marketMakerAddress={marketMakerAddress} />
}

export { MarketRoutes }
