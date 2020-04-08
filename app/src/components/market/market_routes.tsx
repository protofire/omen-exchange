import { useInterval } from '@react-corekit/use-interval'
import { ethers } from 'ethers'
import React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import { IS_CORONA_VERSION, MARKET_FEE } from '../../common/constants'
import { useCheckContractExists, useMarketMakerData } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { MarketBuyPage, MarketDetailsPage, MarketPoolLiquidityPage, MarketSellPage } from '../../pages'
import { getLogger } from '../../util/logger'
import { isAddress } from '../../util/tools'
import { MessageWarning, SectionTitle } from '../common'
import { DisqusComments } from '../common/disqus_comments'
import { InlineLoading } from '../loading'

import { MarketNotFound } from './market_not_found'

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
  const { fetchData, marketMakerData } = useMarketMakerData(marketMakerAddress)
  useInterval(fetchData, 60000)
  if (!contractExists) {
    logger.log(`Market address not found`)
    return <MarketNotFound />
  }

  if (!marketMakerData) {
    return <InlineLoading />
  }
  const { fee, isQuestionFinalized } = marketMakerData

  // Validate Markets with wrong FEE
  const feeBN = ethers.utils.parseEther('' + MARKET_FEE / Math.pow(10, 2))
  if (!fee.eq(feeBN)) {
    logger.log(`Market was not created with this app (different fee)`)
    return <SectionTitle title={'Invalid market'} />
  }

  console.log('marketMakerAddress ' + marketMakerAddress)

  return (
    <Switch>
      <>
        <Route
          exact
          path="/:address"
          render={props => <MarketDetailsPage {...props} marketMakerData={marketMakerData} />}
        />
        {!account ? (
          <MessageWarning text="Please connect to your wallet to open the market..." />
        ) : isQuestionFinalized ? (
          <MessageWarning text="Market closed, question finalized..." />
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
            <Route
              exact
              path="/:address/pool-liquidity"
              render={props => <MarketPoolLiquidityPage {...props} marketMakerData={marketMakerData} />}
            />
          </>
        )}
        {IS_CORONA_VERSION ? <DisqusComments marketMakerAddress={marketMakerAddress} /> : null}
        {/* <ThreeBoxComments threadName={marketMakerAddress} /> */}
      </>
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
