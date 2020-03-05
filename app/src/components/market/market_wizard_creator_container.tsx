import React, { FC, useState } from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'
import { ERC20Service } from '../../services'
import { CPKService } from '../../services/cpk'
import { getLogger } from '../../util/logger'
import { MarketCreationStatus } from '../../util/market_creation_status_data'
import { MarketData } from '../../util/types'
import { ModalConnectWallet } from '../common'

import { MarketWizardCreator } from './market_wizard_creator'

const logger = getLogger('Market::MarketWizardCreatorContainer')

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context

  const [isModalOpen, setModalState] = useState(false)
  const { conditionalTokens, marketMakerFactory, realitio } = useContracts(context)

  const [marketCreationStatus, setMarketCreationStatus] = useState<MarketCreationStatus>(MarketCreationStatus.ready())
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

        // Approve collateral to the proxy contract
        const collateralService = new ERC20Service(provider, account, marketData.collateral.address)
        const hasEnoughAlowance = await collateralService.hasEnoughAllowance(account, cpk.address, marketData.funding)

        if (!hasEnoughAlowance) {
          await collateralService.approveUnlimited(cpk.address)
        }

        const marketMakerAddress = await cpk.createMarket({
          marketData,
          conditionalTokens,
          realitio,
          marketMakerFactory,
        })
        setMarketMakerAddress(marketMakerAddress)

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
        marketCreationStatus={marketCreationStatus}
        marketMakerAddress={marketMakerAddress}
      />
      <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
    </>
  )
}

export { MarketWizardCreatorContainer }
