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
import { FullLoading } from '../loading'

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
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  if (!contractExists) {
    logger.log(`Market address not found`)
    return <MarketNotFound />
  }

  // Validate Markets with wrong FEE
  const { fee, isQuestionFinalized } = marketMakerData
  if (fee === null) {
    return <FullLoading />
  }

  const feeBN = ethers.utils.parseEther('' + MARKET_FEE / Math.pow(10, 2))
  if (!fee.eq(feeBN)) {
    logger.log(`Market was not created with this app (different fee)`)
    return <SectionTitle title={'Invalid market'} />
  }

  return (
    <>
      <Switch>
        <Route component={MarketDetailsPage} exact path="/:address" />
        {!account ? (
          <MessageWarning text="Please connect to your wallet to open the market..." />
        ) : isQuestionFinalized ? (
          <MessageWarning text="Market closed, question finalized..." />
        ) : (
          <>
            <Route component={MarketBuyPage} exact path="/:address/buy" />
            <Route component={MarketSellPage} exact path="/:address/sell" />
            <Route component={MarketPoolLiquidityPage} exact path="/:address/pool-liquidity" />
          </>
        )}
      </Switch>
      {IS_CORONA_VERSION ? <DisqusComments marketMakerAddress={marketMakerAddress} /> : null}
      {/* <ThreeBoxComments threadName={marketMakerAddress} /> */}
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
