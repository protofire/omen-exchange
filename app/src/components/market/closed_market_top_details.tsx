import React from 'react'
import styled from 'styled-components'

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
} from '../common'

const Link = styled.a`
  color: ${props => props.theme.colors.textColor};
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

interface Props {
  marketMakerAddress: string
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
  const context = useConnectedWeb3Context()
  const { marketMakerAddress } = props
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)

  const { arbitrator, category, collateral, questionTemplateId, resolution } = marketMakerData

  const lastDayVolume = use24hsVolume(marketMakerAddress, context)
  const { marketSubtitle, marketTitle } = getMarketTitles(questionTemplateId)

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>{marketTitle}</SubsectionTitle>
        <SubsectionTitleAction>
          <Link href={faqURL} target="_blank">
            {marketSubtitle}
          </Link>
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
