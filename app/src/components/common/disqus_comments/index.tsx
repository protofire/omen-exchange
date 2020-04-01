import Disqus from 'disqus-react'
import React from 'react'
import styled from 'styled-components'

import { DISQUS_SHORTNAME, DISQUS_URL } from '../../../common/constants'

const DisqusCustom = styled.div`
  margin: 30px auto;
  max-width: 100%;
  width: ${props => props.theme.mainContainer.maxWidth};
`

export const DisqusComments: React.FC<{ marketMakerAddress: string }> = ({ marketMakerAddress }) => {
  const config = React.useMemo(() => {
    return {
      url: `${DISQUS_URL}/${marketMakerAddress}`,
      identifier: marketMakerAddress,
      title: marketMakerAddress,
    }
  }, [marketMakerAddress])

  return (
    <DisqusCustom>
      <Disqus.DiscussionEmbed config={config} shortname={DISQUS_SHORTNAME} />
    </DisqusCustom>
  )
}
