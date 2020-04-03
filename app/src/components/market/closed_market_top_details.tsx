import React from 'react'

import { useMarketMakerData } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { use24hsVolume } from '../../hooks/use24hsVolume'
import { formatBigNumber, formatDate } from '../../util/tools'
import {
  DisplayArbitrator,
  GridTwoColumns,
  SubsectionTitle,
  SubsectionTitleAction,
  SubsectionTitleWrapper,
  TitleValue,
  Tooltip,
} from '../common'

interface Props {
  marketMakerAddress: string
}

const ClosedMarketTopDetails: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { marketMakerAddress } = props
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)

  const { arbitrator, category, collateral, resolution } = marketMakerData

  const lastDayVolume = use24hsVolume(marketMakerAddress, context)
  const title = 'Binary Market'

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>{title}</SubsectionTitle>
        <SubsectionTitleAction>
          What is a binary market?
          <Tooltip description="mockDescription" id="tooltip-closed-detail"></Tooltip>
        </SubsectionTitleAction>
      </SubsectionTitleWrapper>

      <GridTwoColumns>
        <TitleValue title={'Category'} value={category} />
        <TitleValue title={'Resolution Date'} value={resolution && formatDate(resolution)} />
        <TitleValue title={'Arbitrator/Oracle'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
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

export { ClosedMarketTopDetails }
