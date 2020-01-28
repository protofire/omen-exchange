import React, { FC, useState } from 'react'

import { getLogger } from '../../util/logger'
import { MarketWizardCreator } from './market_wizard_creator'
import { MarketData } from '../../util/types'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'
import { ModalConnectWallet } from '../common/modal_connect_wallet'
import { MarketCreationStatus } from '../../util/market_creation_status_data'
import { CPKService } from '../../services/cpk'
import { ERC20Service } from '../../services'

const logger = getLogger('Market::MarketWizardCreatorContainer')

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
  const { library: provider, account } = context

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

        // Approve collateral to the proxy contract
        const collateralService = new ERC20Service(provider, account, marketData.collateral.address)
        const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
          account,
          cpk.address,
          marketData.funding,
        )

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
        marketMakerAddress={marketMakerAddress}
        marketCreationStatus={marketCreationStatus}
      />
      <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
    </>
  )
}

export { MarketWizardCreatorContainer }
