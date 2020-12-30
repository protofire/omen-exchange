import { BigNumber } from 'ethers/utils'
import React, { FC, useState } from 'react'
import { useHistory } from 'react-router'

import { useConnectedCPKContext, useContracts, useGraphMeta } from '../../../../hooks'
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
  const cpk = useConnectedCPKContext()
  const { account, library: provider } = context
  const history = useHistory()
  const { waitForBlockToSync } = useGraphMeta()

  const [isModalOpen, setModalState] = useState(false)
  const { conditionalTokens, marketMakerFactory, realitio } = useContracts(context)

  const [marketCreationStatus, setMarketCreationStatus] = useState<MarketCreationStatus>(MarketCreationStatus.ready())
  const [marketMakerAddress, setMarketMakerAddress] = useState<string | null>(null)

  const getCompoundInterestRate = async (symbol: string): Promise<number> => {
    const cToken = `c${symbol.toLowerCase()}`
    const compoundCollateralToken = cToken as KnownToken
    const compoundTokenDetails = getToken(context.networkId, compoundCollateralToken)
    const compoundService = new CompoundService(compoundTokenDetails.address, cToken, provider, account)
    const supplyRate = await compoundService.calculateSupplyRateAPY()
    return supplyRate
  }

  const handleSubmit = async (marketData: MarketData) => {
    try {
      if (!account) {
        setModalState(true)
      } else {
        if (!marketData.resolution) {
          throw new Error('resolution time was not specified')
        }
        if (!cpk) {
          return
        }

        setMarketCreationStatus(MarketCreationStatus.creatingAMarket())

        if (!cpk.cpk.isSafeApp()) {
          // Approve collateral to the proxy contract
          const collateralService = new ERC20Service(provider, account, marketData.userInputCollateral.address)
          const hasEnoughAlowance = await collateralService.hasEnoughAllowance(account, cpk.address, marketData.funding)
          if (!hasEnoughAlowance) {
            await collateralService.approveUnlimited(cpk.address)
          }
        }
        let compoundTokenDetails = marketData.userInputCollateral
        let compoundService = null
        const useCompoundReserve = marketData.useCompoundReserve
        if (useCompoundReserve) {
          const cToken = `c${marketData.userInputCollateral.symbol.toLowerCase()}`
          console.log(cToken)
          const compoundCollateralToken = cToken as KnownToken
          compoundTokenDetails = getToken(context.networkId, compoundCollateralToken)
          marketData.userInputToken = marketData.userInputCollateral
          compoundService = new CompoundService(compoundTokenDetails.address, cToken, provider, account)
        }
        const { marketMakerAddress, transaction } = await cpk.createMarket({
          compoundService,
          compoundTokenDetails,
          conditionalTokens,
          marketData,
          realitio,
          marketMakerFactory,
          useCompoundReserve,
        })
        setMarketMakerAddress(marketMakerAddress)

        if (transaction.blockNumber) {
          await waitForBlockToSync(transaction.blockNumber)
        }

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
        getCompoundInterestRate={getCompoundInterestRate}
        marketCreationStatus={marketCreationStatus}
        marketMakerAddress={marketMakerAddress}
      />
      <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
    </>
  )
}

export { MarketWizardCreatorContainer }
