import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getLogger } from '../../../util/logger'
import { formatBigNumber, formatDate } from '../../../util/tools'
import { MarketMakerData } from '../../../util/types'
import {
  DisplayArbitrator,
  GridTwoColumns,
  SubsectionTitle,
  SubsectionTitleAction,
  SubsectionTitleWrapper,
  TitleValue,
} from '../../common'
const logger = getLogger('Market::View')

interface Props {
  toggleTitleAction: string
  title: string
  marketMakerData: MarketMakerData
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

const MarketTopDetails: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const [showingExtraInformation, setExtraInformation] = useState(false)

  const toggleExtraInformation = () =>
    showingExtraInformation ? setExtraInformation(false) : setExtraInformation(true)

  const { marketMakerData } = props
  const {
    address: marketMakerAddress,
    arbitrator,
    collateral,
    marketMakerFunding,
    marketMakerUserFunding,
    question,
    totalEarnings,
    userEarnings,
  } = marketMakerData

  const [hash, setHash] = useState<Maybe<string>>(null)
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

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>{props.title}</SubsectionTitle>
        <SubsectionTitleAction onClick={toggleExtraInformation}>
          {showingExtraInformation ? 'Hide' : 'Show'} {props.toggleTitleAction}
        </SubsectionTitleAction>
      </SubsectionTitleWrapper>
      <GridTwoColumns>
        {showingExtraInformation ? (
          <>
            <TitleValue
              title={'Total Pool Tokens'}
              value={collateral && formatBigNumber(marketMakerFunding, collateral.decimals)}
            />
            <TitleValue
              title={'Total Pool Earnings'}
              value={collateral && `${formatBigNumber(totalEarnings, collateral.decimals)} ${collateral.symbol}`}
            />
            <TitleValue
              title={'My Pool Tokens'}
              value={collateral && formatBigNumber(marketMakerUserFunding, collateral.decimals)}
            />
            <TitleValue
              title={'My Pool Earnings'}
              value={collateral && `${formatBigNumber(userEarnings, collateral.decimals)} ${collateral.symbol}`}
            />
          </>
        ) : null}
        <TitleValue title={'Category'} value={question.category} />
        <TitleValue title={'Resolution Date'} value={question.resolution && formatDate(question.resolution)} />
        <TitleValue
          title={'Arbitrator/Oracle'}
          value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} questionId={question.id} />}
        />
        <TitleValue
          title={'24h Volume'}
          value={
            collateral && lastDayVolume
              ? `${formatBigNumber(lastDayVolume, collateral.decimals)} ${collateral.symbol}`
              : '-'
          }
        />
      </GridTwoColumns>
    </>
  )
}

export { MarketTopDetails }
