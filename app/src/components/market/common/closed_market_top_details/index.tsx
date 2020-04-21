import { BigNumber } from 'ethers/utils'
import React from 'react'

import { formatBigNumber, formatDate } from '../../../../util/tools'
import { MarketMakerData } from '../../../../util/types'
import { GridTwoColumns, SubsectionTitleWrapper, TitleValue } from '../../../common'
import { DisplayArbitrator } from '../display_arbitrator'
import { MarketTitle } from '../market_title'

interface Props {
  marketMakerData: MarketMakerData
  collateral: BigNumber
}

const ClosedMarketTopDetails: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const { arbitrator, collateral: collateralToken, collateralVolume, question } = marketMakerData

  const resolutionFormat = question.resolution ? formatDate(question.resolution) : ''
  const totalVolumeFormat = collateralVolume
    ? `${formatBigNumber(collateralVolume, collateralToken.decimals)} ${collateralToken.symbol}`
    : '-'

  return (
    <>
      <SubsectionTitleWrapper>
        <MarketTitle showSubtitleFAQ={true} templateId={question.templateId} />
      </SubsectionTitleWrapper>
      <GridTwoColumns>
        <TitleValue title={'Category'} value={question.category} />
        <TitleValue title={'Earliest Resolution Date'} value={resolutionFormat} />
        <TitleValue title={'Arbitrator/Oracle'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
        <TitleValue title={'Total Volume'} value={totalVolumeFormat} />
      </GridTwoColumns>
    </>
  )
}

export { ClosedMarketTopDetails }
