import React, { FC } from 'react'

import { SectionTitle } from '../common/section_title'
import { formatDate } from '../../util/tools'

interface Props {
  marketMakerAddress: string
  question: string
  resolution: Maybe<Date>
}

const MarketFund: FC<Props> = props => {
  const { question, resolution, marketMakerAddress } = props

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <>Market fund address {marketMakerAddress}</>
    </>
  )
}

export { MarketFund }
