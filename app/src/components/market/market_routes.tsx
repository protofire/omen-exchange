import React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'
import { ethers } from 'ethers'

import { MarketBuyPage, MarketDetailsPage, MarketFundPage, MarketSellPage } from '../../pages'
import { isAddress } from '../../util/tools'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useCheckContractExists } from '../../hooks/useCheckContractExists'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { SectionTitle } from '../common/section_title'
import { Loading } from '../common/loading'
import { MARKET_FEE } from '../../common/constants'
import { getLogger } from '../../util/logger'
import { MarketNotFound } from '../common/market_not_found'
import { MessageWarning } from '../common/message_warning'

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
    return <Loading full={true} />
  }

  const feeBN = ethers.utils.parseEther('' + MARKET_FEE / Math.pow(10, 2))
  if (!fee.eq(feeBN)) {
    logger.log(`Market was not created with this app (different fee)`)
    return <SectionTitle title={'Invalid market'} />
  }

  return (
    <Switch>
      <Route exact path="/:address" component={MarketDetailsPage} />
      {!account ? (
        <MessageWarning text="Please connect to your wallet to open the market..." />
      ) : isQuestionFinalized ? (
        <MessageWarning text="Market closed, question finalized..." />
      ) : (
        <>
          <Route exact path="/:address/buy" component={MarketBuyPage} />
          <Route exact path="/:address/sell" component={MarketSellPage} />
          <Route exact path="/:address/fund" component={MarketFundPage} />
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
