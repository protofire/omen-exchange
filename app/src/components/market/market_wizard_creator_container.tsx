import React, { FC, useState } from 'react'
import { BigNumber } from 'ethers/utils'

import { getLogger } from '../../util/logger'
import { MarketWizardCreator } from './market_wizard_creator'
import { MarketData } from '../../util/types'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'
import { ModalConnectWallet } from '../common/modal_connect_wallet'
import { MarketCreationStatus } from '../../util/market_creation_status_data'
import { CPKService } from '../../services/cpk'

const logger = getLogger('Market::MarketWizardCreatorContainer')

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
  const { library: provider, account, networkId } = context

  const [isModalOpen, setModalState] = useState(false)
  const { conditionalTokens, marketMakerFactory, realitio } = useContracts(context)

  const [marketCreationStatus, setMarketCreationStatus] = useState<MarketCreationStatus>(
    MarketCreationStatus.ready(),
  )
  const [marketMakerAddress, setMarketMakerAddress] = useState<string | null>(null)

  const handleSubmit = async (marketData: MarketData) => {
    try {
      if (!account) {
        setModalState(true)
      } else {
        if (!marketData.resolution) {
          throw new Error('resolution time was not specified')
        }

        setMarketCreationStatus(MarketCreationStatus.creatingAMarket())

        const cpk = await CPKService.create(provider)
        const marketMakerAddress = await cpk.createMarket({
          networkId,
          marketData,
          conditionalTokens,
          realitio,
          marketMakerFactory,
        })
        setMarketMakerAddress(marketMakerAddress)

        setMarketCreationStatus(MarketCreationStatus.addFunding())
        await cpk.addFundsToTheMarket({
          funding: marketData.funding,
          marketMakerAddress,
          collateral: marketData.collateral,
          outcomes: marketData.outcomes.map(o => new BigNumber(o.probability)),
        })

        setMarketCreationStatus(MarketCreationStatus.done())
      }
    } catch (err) {
      setMarketCreationStatus(MarketCreationStatus.error(err))
      logger.error(err.message)
    }
  }

  return (
    <>
      <MarketWizardCreator
        callback={handleSubmit}
        marketMakerAddress={marketMakerAddress}
        marketCreationStatus={marketCreationStatus}
      />
      <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
    </>
  )
}

export { MarketWizardCreatorContainer }
