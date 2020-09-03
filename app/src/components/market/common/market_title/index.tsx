import React from 'react'

import { getMarketTitles } from '../../../../util/tools'
import { SubsectionTitle } from '../../../common'
import { IconStar } from '../../../common/icons/IconStar'

interface Props {
  title?: string
  templateId: number
}

const MarketTitle: React.FC<Props> = (props: Props) => {
  const { templateId, title } = props
  const { marketTitle } = getMarketTitles(templateId)

  return (
    <>
      <SubsectionTitle>{title || marketTitle}</SubsectionTitle>
    </>
  )
}

export { MarketTitle }
