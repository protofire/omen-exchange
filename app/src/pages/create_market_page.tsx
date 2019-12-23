import React from 'react'

import { MarketWizardCreatorContainer } from '../components'
import connectors from '../util/connectors'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import { useWeb3Context } from 'web3-react/dist'

const CreateMarketConnectedPage = (props: any) => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketWizardCreatorContainer {...props} />
    </ConnectedWeb3>
  )
}

const CreateMarketDisconnectedPage = (props: any) => {
  return (
    <ConnectedWeb3 infura={true}>
      <MarketWizardCreatorContainer {...props} />
    </ConnectedWeb3>
  )
}

const CreateMarketPage = (props: any) => {
  const { active } = useWeb3Context()
  const connector = localStorage.getItem('CONNECTOR')

  return active || (connector && connector in connectors) ? (
    <CreateMarketConnectedPage {...props} />
  ) : (
    <CreateMarketDisconnectedPage {...props} />
  )
}

export { CreateMarketPage }
