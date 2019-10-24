import React from 'react'

import { MarketWizardCreatorContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'

const CreateMarketPage = () => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketWizardCreatorContainer />
    </ConnectedWeb3>
  )
}

export { CreateMarketPage }
