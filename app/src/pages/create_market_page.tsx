import React from 'react'

import { MarketConnectionPage } from '../hooks/marketConnection'
import { MarketWizardCreatorContainer } from '../components'

const CreateMarketPage = () => {
  return (
    <MarketConnectionPage>
      <MarketWizardCreatorContainer />
    </MarketConnectionPage>
  )
}

export { CreateMarketPage }
