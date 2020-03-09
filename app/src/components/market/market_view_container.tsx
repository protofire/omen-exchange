import React, { useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { Loading } from '../common/loading'

import { MarketView } from './market_view'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

interface Props {
  marketMakerAddress: string
}

const GET_COLLATERAL_VOLUME_NOW = gql`
  query Current($id: String) {
    fixedProductMarketMakers(where: { id: $id }) {
      collateralVolume
    }
  }
`
const GET_COLLATERAL_VOLUME_24HS_EARLIER = gql`
  query AfterHash($id: String, $hash: String!) {
    fixedProductMarketMakers(where: { id: $id }, block: { hash: $hash }) {
      collateralVolume
    }
  }
`

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const [hash, setHash] = useState<Maybe<String>>(null)
  const { marketMakerData, status } = useMarketMakerData(marketMakerAddress, context)
  const { library: provider } = context

  const { data: volume1, variables: vars1 } = useQuery(GET_COLLATERAL_VOLUME_NOW, {
    variables: { id: marketMakerAddress.toLowerCase() },
  })

  const { data: volume2, variables: vars2 } = useQuery(GET_COLLATERAL_VOLUME_24HS_EARLIER, {
    variables: { id: marketMakerAddress.toLowerCase(), hash: hash && hash.toLowerCase() },
  })

  console.log('Volume1', volume1, vars1)
  console.log('Volume2', volume2, vars2)

  const {
    arbitrator,
    balances,
    category,
    collateral,
    isConditionResolved,
    isQuestionFinalized,
    marketMakerFunding,
    question,
    questionId,
    resolution,
  } = marketMakerData

  useEffect(() => {
    const get24hsVolume = async () => {
      const BLOCKS_PER_SECOND = 15
      const OFFSET = (60 * 60 * 24) / BLOCKS_PER_SECOND
      const lastBlock = await provider.getBlockNumber()
      console.log('lastblock', lastBlock)
      const { hash, number } = await provider.getBlock(lastBlock - OFFSET)
      setHash(hash)
      console.log('block', number)
    }

    get24hsVolume()
  }, [provider])

  if (!collateral) {
    return <Loading full={true} />
  }

  return (
    <MarketView
      account={context.account}
      arbitrator={arbitrator}
      balances={balances}
      category={category || ''}
      collateral={collateral}
      funding={marketMakerFunding}
      isConditionResolved={isConditionResolved}
      isQuestionFinalized={isQuestionFinalized}
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      questionId={questionId}
      resolution={resolution}
      status={status}
    />
  )
}

export { MarketViewContainer }
