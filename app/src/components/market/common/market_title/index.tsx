import React from 'react'
import styled from 'styled-components'

import { getMarketTitles } from '../../../../util/tools'
import { SubsectionTitle } from '../../../common'
import { IconStar } from '../../../common/icons/IconStar'

interface Props {
  title?: string
  templateId: number
  klerosTCRregistered?: Maybe<boolean>
}

const IconStarWrapper = styled.div`
  margin-left: 6px;
`

const MarketTitle: React.FC<Props> = (props: Props) => {
  const { klerosTCRregistered, templateId, title } = props
  const { marketTitle } = getMarketTitles(templateId)

  return (
    <>
      <SubsectionTitle>{title || marketTitle}</SubsectionTitle>
      {klerosTCRregistered && (
        <IconStarWrapper>
          <IconStar />
        </IconStarWrapper>
      )}
    </>
  )
}

export { MarketTitle }
