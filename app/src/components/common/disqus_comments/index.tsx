import Disqus from 'disqus-react'
import React from 'react'

import { DISQUS_SHORTNAME, DISQUS_URL } from '../../../common/constants'

export const DisqusComments: React.FC<{ marketMakerAddress: string }> = ({ marketMakerAddress }) => {
  const config = React.useMemo(() => {
    return {
      url: `${DISQUS_URL}/${marketMakerAddress}`,
      identifier: marketMakerAddress,
      title: marketMakerAddress,
    }
  }, [marketMakerAddress])

  return <Disqus.DiscussionEmbed config={config} shortname={DISQUS_SHORTNAME} />
}
