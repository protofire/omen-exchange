import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getLogger } from '../util/logger'

import { ConnectedWeb3Context } from './connectedWeb3'

const logger = getLogger('Market::use24hsVolume')

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

export const use24hsVolume = (marketMakerAddress: string, context: ConnectedWeb3Context): Maybe<BigNumber> => {
  const [hash, setHash] = useState<Maybe<string>>(null)
  const [lastDayVolume, setLastDayVolume] = useState<Maybe<BigNumber>>(null)

  const { library: provider } = context

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
    const marketNow = volumeNow.fixedProductMarketMakers[0]
    const marketBefore = volumeBefore.fixedProductMarketMakers[0]
    const now = new BigNumber(marketNow ? marketNow.collateralVolume : 0)
    const before = new BigNumber(marketBefore ? marketBefore.collateralVolume : 0)

    setLastDayVolume(now.sub(before))
  }

  useEffect(() => {
    const get24hsVolume = async () => {
      const BLOCKS_PER_SECOND = 15
      const OFFSET = Math.round((60 * 60 * 24) / BLOCKS_PER_SECOND)
      const lastBlock = await provider.getBlockNumber()
      const { hash } = await provider.getBlock(lastBlock - OFFSET)
      setHash(hash)
    }

    get24hsVolume()
  }, [provider])

  return lastDayVolume
}
