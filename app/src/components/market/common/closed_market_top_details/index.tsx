import { BigNumber } from 'ethers/utils'
import React from 'react'

import { use24hsVolume } from '../../../../hooks/use24hsVolume'
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

const faqURL = 'https://docs.google.com/document/d/1w-mzDZBHqedSCxt_T319e-JzO5jFOMwsGseyCOqFwqQ'

const ClosedMarketTopDetails: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const { address: marketMakerAddress, arbitrator, collateral: collateralToken, question } = marketMakerData

  const lastDayVolume = use24hsVolume(marketMakerAddress)
  const { marketSubtitle, marketTitle } = getMarketTitles(question.templateId)
  const resolutionFormat = question.resolution ? formatDate(question.resolution) : ''
  const lastDayVolumeFormat = lastDayVolume
    ? `${formatBigNumber(lastDayVolume, collateralToken.decimals)} ${collateralToken.symbol}`
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
        <TitleValue title={'24h Volume'} value={lastDayVolumeFormat} />
      </GridTwoColumns>
    </>
  )
}

export { ClosedMarketTopDetails }
