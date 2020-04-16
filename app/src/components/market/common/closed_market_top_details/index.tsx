import { BigNumber } from 'ethers/utils'
import React from 'react'

import { LINK_FAQ } from '../../../../common/constants'
import { formatBigNumber, formatDate } from '../../../../util/tools'
import { MarketMakerData } from '../../../../util/types'
import {
  GridTwoColumns,
  SubsectionTitle,
  SubsectionTitleAction,
  SubsectionTitleWrapper,
  TitleValue,
} from '../../../common'
import { DisplayArbitrator } from '../display_arbitrator'

interface Props {
  marketMakerData: MarketMakerData
  collateral: BigNumber
}

const getMarketTitles = (templateId: Maybe<number>) => {
  if (templateId === 5 || templateId === 6) {
    return { marketTitle: 'Nuanced Binary Market', marketSubtitle: 'What is a nuanced-binary market?' }
  } else if (templateId === 2) {
    return { marketTitle: 'Single Select Market', marketSubtitle: 'What is a single-select market?' }
  } else {
    return { marketTitle: 'Binary Market', marketSubtitle: 'What is a binary market?' }
  }
}

const faqURL = LINK_FAQ

const ClosedMarketTopDetails: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const { arbitrator, collateral: collateralToken, collateralVolume, question } = marketMakerData

  const { marketSubtitle, marketTitle } = getMarketTitles(question.templateId)
  const resolutionFormat = question.resolution ? formatDate(question.resolution) : ''
  const totalVolumeFormat = collateralVolume
    ? `${formatBigNumber(collateralVolume, collateralToken.decimals)} ${collateralToken.symbol}`
    : '-'

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>{marketTitle}</SubsectionTitle>
        {faqURL && (
          <SubsectionTitleAction
            onClick={() => {
              window.open(faqURL)
            }}
          >
            {marketSubtitle}
          </SubsectionTitleAction>
        )}
      </SubsectionTitleWrapper>
      <GridTwoColumns>
        <TitleValue title={'Category'} value={question.category} />
        <TitleValue title={'Resolution Date'} value={resolutionFormat} />
        <TitleValue
          title={'Arbitrator/Oracle'}
          value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} questionId={question.id} />}
        />
        <TitleValue title={'Total Volume'} value={totalVolumeFormat} />
      </GridTwoColumns>
    </>
  )
}

export { ClosedMarketTopDetails }
