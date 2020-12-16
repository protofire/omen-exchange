import React, { FC, useState } from 'react'
import { useHistory } from 'react-router'

import { useContracts } from '../../../../hooks'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { ERC20Service } from '../../../../services'
import { CompoundService } from '../../../../services/compound_service'
import { CPKService } from '../../../../services/cpk'
import { getLogger } from '../../../../util/logger'
import { MarketCreationStatus } from '../../../../util/market_creation_status_data'
import { getToken } from '../../../../util/networks'
import { MarketData } from '../../../../util/types'
import { ModalConnectWallet } from '../../../modal'

import { MarketWizardCreator } from './market_wizard_creator'

const logger = getLogger('Market::MarketWizardCreatorContainer')

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const history = useHistory()

  const [isModalOpen, setModalState] = useState(false)
  const { conditionalTokens, marketMakerFactory, realitio } = useContracts(context)

  const [marketCreationStatus, setMarketCreationStatus] = useState<MarketCreationStatus>(MarketCreationStatus.ready())
  const [marketMakerAddress, setMarketMakerAddress] = useState<string | null>(null)

  const handleSubmit = async (marketData: MarketData) => {
    console.log(marketData)
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
        const useCompoundReserve = true
        if (!hasEnoughAlowance) {
          await collateralService.approveUnlimited(cpk.address)
        }
        console.log(marketData)
        console.log('***')
        let compoundTokenDetails = marketData.collateral
        let compoundService = null
        if (useCompoundReserve) {
          const cToken = `c${marketData.collateral.symbol.toLowerCase()}`
          const compoundCollateralToken = cToken as KnownToken
          compoundTokenDetails = getToken(context.networkId, compoundCollateralToken)
          marketData.userInputToken = marketData.collateral
          // marketData.collateral = compoundTokenDetails
          compoundService = new CompoundService(compoundTokenDetails.address, cToken, provider, account)
        }
        const marketMakerAddress = await cpk.createMarket({
          compoundService,
          compoundTokenDetails,
          conditionalTokens,
          marketData,
          realitio,
          marketMakerFactory,
          useCompoundReserve,
        })
        setMarketMakerAddress(marketMakerAddress)
        setMarketCreationStatus(MarketCreationStatus.done())
        history.replace(`/${marketMakerAddress}`)
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
