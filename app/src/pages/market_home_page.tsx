import React from 'react'

import { MarketConnectionPage } from '../hooks/marketConnection'
import { MarketHomeContainer } from '../components'

const MarketHomePage = (props: any) => {
  return (
    <MarketConnectionPage>
      <MarketHomeContainer {...props} />
    </MarketConnectionPage>
  )
}

export { MarketHomePage }
