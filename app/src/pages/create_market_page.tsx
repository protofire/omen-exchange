import React from 'react'

import { MarketWizardCreatorContainer } from '../components'
import connectors from '../util/connectors'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import { useWeb3Context } from 'web3-react'

const CreateMarketConnectedPage = () => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketWizardCreatorContainer />
    </ConnectedWeb3>
  )
}

const CreateMarketDisconnectedPage = () => {
  return (
    <ConnectedWeb3 infura={true}>
      <MarketWizardCreatorContainer />
    </ConnectedWeb3>
  )
}

const CreateMarketPage = () => {
  const { active } = useWeb3Context()
  const connector = localStorage.getItem('CONNECTOR')

  return active || (connector && connector in connectors) ? (
    <CreateMarketConnectedPage />
  ) : (
    <CreateMarketDisconnectedPage />
  )
}

export { CreateMarketPage }
