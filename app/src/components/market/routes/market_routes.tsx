import { useInterval } from '@react-corekit/use-interval'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import { FETCH_DETAILS_INTERVAL, MAX_MARKET_FEE } from '../../../common/constants'
import { useCheckContractExists, useMarketMakerData } from '../../../hooks'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import {
  MarketBuyPage,
  MarketDetailsPage,
  MarketHistoryPage,
  MarketPoolLiquidityPage,
  MarketSellPage,
} from '../../../pages'
import { getLogger } from '../../../util/logger'
import { isAddress } from '../../../util/tools'
import { ThreeBoxComments } from '../../comments'
import { SectionTitle } from '../../common'
import { Message, MessageType } from '../../common/message'
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
  const { account } = context

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
  const { fee, isQuestionFinalized } = marketMakerData

  // Validate Markets with wrong FEE
  const feeBN = ethers.utils.parseEther('' + MAX_MARKET_FEE / Math.pow(10, 2))
  const zeroBN = new BigNumber(0)
  if (!(fee.gte(zeroBN) && fee.lte(feeBN))) {
    logger.log(`Market was not created with this app (different fee)`)
    return <SectionTitle title={'Invalid market'} />
  }

  return (
    <Switch>
      <Route
        exact
        path="/:address"
        render={props => (
          <>
            <MarketDetailsPage {...props} marketMakerData={marketMakerData} />
            <ThreeBoxComments threadName={marketMakerAddress} />
          </>
        )}
      />
      {!account ? (
        <Message text="Please connect to your wallet to open the market..." type={MessageType.warning} />
      ) : (
        <>
          <Route
            exact
            path="/:address/pool-liquidity"
            render={props => <MarketPoolLiquidityPage {...props} marketMakerData={marketMakerData} />}
          />
          <Route
            exact
            path="/:address/trade-history"
            render={props => <MarketHistoryPage {...props} marketMakerData={marketMakerData} />}
          />
        </>
      )}
      {!account ? (
        <Message text="Please connect to your wallet to open the market..." type={MessageType.warning} />
      ) : isQuestionFinalized ? (
        <Message text="Market closed, question finalized..." type={MessageType.warning} />
      ) : (
        <>
          <Route
            exact
            path="/:address/buy"
            render={props => <MarketBuyPage {...props} marketMakerData={marketMakerData} />}
          />
          <Route
            exact
            path="/:address/sell"
            render={props => <MarketSellPage {...props} marketMakerData={marketMakerData} />}
          />
        </>
      )}
    </Switch>
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
