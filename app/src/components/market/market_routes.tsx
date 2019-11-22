import React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import { MarketBuyPage, MarketDetailsPage, MarketFundPage, MarketSellPage } from '../../pages'
import { isAddress } from '../../util/tools'
import { ConnectedWeb3, useConnectedWeb3Context, useConnectWeb3 } from '../../hooks/connectedWeb3'
import { useCheckContractExists } from '../../hooks/useCheckContractExists'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { SectionTitle } from '../common/section_title'
import { FullLoading } from '../common/full_loading'
import { FEE } from '../../common/constants'
import { getLogger } from '../../util/logger'

const logger = getLogger('Market::Routes')

interface RouteParams {
  address: string
}

interface Props {
  marketMakerAddress: string
}

const MarketValidateContractAddress: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const { fee } = marketMakerData
  const contractExists = useCheckContractExists(marketMakerAddress, context)

  if (fee === null) {
    return <FullLoading />
  }
  if (!fee.eq(FEE)) {
    logger.log(`Market was not created with this app (different fee)`)
    return <SectionTitle title={'Invalid market'} />
  }

  if (!contractExists) {
    logger.log(`Market address not found`)
    return <SectionTitle title={'Market not found'} />
  }

  return (
    <Switch>
      <Route exact path="/:address" component={MarketDetailsPage} />
      <Route exact path="/:address/buy" component={MarketBuyPage} />
      <Route exact path="/:address/sell" component={MarketSellPage} />
      <Route exact path="/:address/fund" component={MarketFundPage} />
    </Switch>
  )
}

const MarketRoutes = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  const marketMakerAddress = props.match.params.address
  if (!isAddress(marketMakerAddress)) {
    logger.log(`Contract address not valid`)
    return <Redirect to="/" />
  }

  return (
    <ConnectedWeb3>
      <MarketValidateContractAddress marketMakerAddress={marketMakerAddress} />
    </ConnectedWeb3>
  )
}

export { MarketRoutes }
