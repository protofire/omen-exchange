import React from 'react'

import { LINK_FAQ } from '../../../../common/constants'
import { SubsectionTitle, SubsectionTitleAction } from '../../../common'

interface Props {
  title?: string
  templateId: number
  showSubtitleFAQ?: boolean
}

const getMarketTitles = (templateId: Maybe<number>) => {
  if (templateId === 5 || templateId === 6) {
    return { marketTitle: 'Nuanced Binary Market', marketSubtitle: 'What is a nuanced-binary market?' }
  } else if (templateId === 2) {
    return { marketTitle: 'Categorical Market', marketSubtitle: 'What is a categorical market?' }
  } else {
    return { marketTitle: 'Binary Market', marketSubtitle: 'What is a binary market?' }
  }
}

const MarketTitle: React.FC<Props> = (props: Props) => {
  const { showSubtitleFAQ, templateId, title } = props
  const { marketSubtitle, marketTitle } = getMarketTitles(templateId)

  const SUB_LINK = '#heading=h.9awaoq9ub17q'
  return (
    <>
      <SubsectionTitle>{title || marketTitle}</SubsectionTitle>
      {LINK_FAQ && showSubtitleFAQ && (
        <SubsectionTitleAction
          onClick={() => {
            window.open(`${LINK_FAQ}${SUB_LINK}`)
          }}
        >
          {marketSubtitle}
        </SubsectionTitleAction>
      )}
    </>
  )
}

export { MarketTitle }
