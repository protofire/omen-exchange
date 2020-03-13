import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'

import { useMarketMakerData } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { getLogger } from '../../util/logger'
import { Loading } from '../common'

import { MarketView } from './market_view'

const logger = getLogger('Market::View')

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

const buildQuery24hsEarlier = (hash: Maybe<string>) => {
  return gql`
  query AfterHash($id: String) {
    fixedProductMarketMakers(where: { id: $id }, block: { hash: "${hash}" }) {
      collateralVolume
    }
  }
`
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const [hash, setHash] = useState<Maybe<string>>(null)
  const { marketMakerData, status } = useMarketMakerData(marketMakerAddress, context)
  const { library: provider } = context

  const [lastDayVolume, setLastDayVolume] = useState<Maybe<BigNumber>>(null)

  const { data: volumeNow, error: errorVolumeNow } = useQuery(GET_COLLATERAL_VOLUME_NOW, {
    skip: !!lastDayVolume,
    variables: { id: marketMakerAddress.toLowerCase() },
  })

  const { data: volumeBefore, error: errorVolumeBefore } = useQuery(buildQuery24hsEarlier(hash && hash.toLowerCase()), {
    skip: !!lastDayVolume || !hash,
    variables: { id: marketMakerAddress.toLowerCase() },
  })

  if (errorVolumeBefore || errorVolumeNow) {
    setLastDayVolume(null)
    errorVolumeBefore && logger.log(errorVolumeBefore)
    errorVolumeNow && logger.log(errorVolumeNow)
  } else if (volumeNow && volumeBefore) {
    const now = new BigNumber(volumeNow.fixedProductMarketMakers[0].collateralVolume)
    const before = new BigNumber(volumeBefore.fixedProductMarketMakers[0].collateralVolume)

    setLastDayVolume(now.sub(before))
  }

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
    totalPoolShares,
    userPoolShares,
  } = marketMakerData

  useEffect(() => {
    const get24hsVolume = async () => {
      const BLOCKS_PER_SECOND = 15
      const OFFSET = Math.round((60 * 60 * 24) / BLOCKS_PER_SECOND)
      const lastBlock = await provider.getBlockNumber()
      const { hash } = await provider.getBlock(lastBlock - OFFSET)
      setHash(hash)
    }

    provider && get24hsVolume()
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
      lastDayVolume={lastDayVolume}
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      questionId={questionId}
      resolution={resolution}
      status={status}
      totalPoolShares={totalPoolShares}
      userPoolShares={userPoolShares}
    />
  )
}

export { MarketViewContainer }
