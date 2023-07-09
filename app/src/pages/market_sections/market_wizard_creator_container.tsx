import React, { FC, useState } from 'react'
import { useHistory } from 'react-router'

import { MarketWizardCreator } from '../../components/market/market_create/market_wizard_creator'
import { ModalConnectWalletWrapper, ModalTransactionWrapper } from '../../components/modal'
import { useConnectedWeb3Context } from '../../contexts'
import { useContracts } from '../../hooks'
import { ERC20Service } from '../../services'
import { MarketCreationStatus } from '../../util/market_creation_status_data'
import { pseudoNativeAssetAddress } from '../../util/networks'
import { waitUntilContractDeployed } from '../../util/tools/web3'
import { MarketData, TransactionStep } from '../../util/types'

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
  const { fetchBalances } = context.balances
  const { account, cpk, library: provider, setTxState, txHash, txState } = context
  const history = useHistory()

  const [isModalOpen, setModalState] = useState(false)
  const { conditionalTokens, marketMakerFactoryV2, realitio } = useContracts(context)

  const [marketCreationStatus, setMarketCreationStatus] = useState<MarketCreationStatus>(MarketCreationStatus.ready())
  const [marketMakerAddress, setMarketMakerAddress] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)

  const handleSubmit = async (marketData: MarketData, isScalar: boolean) => {
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

        setTxState(TransactionStep.waitingConfirmation)
        setIsTransactionModalOpen(true)

        if (!cpk.isSafeApp && marketData.collateral.address !== pseudoNativeAssetAddress) {
          // Approve collateral to the proxy contract
          const collateralService = new ERC20Service(provider, account, marketData.collateral.address)
          const hasEnoughAlowance = await collateralService.hasEnoughAllowance(account, cpk.address, marketData.funding)
          if (!hasEnoughAlowance) {
            await collateralService.approveUnlimited(cpk.address)
          }
        }

        if (isScalar) {
          setMessage('Creating scalar market...')
          const { marketMakerAddress } = await cpk.createScalarMarket({
            marketData,
            conditionalTokens,
            realitio,
            marketMakerFactory: marketMakerFactoryV2,
          })
          await waitUntilContractDeployed(provider, marketMakerAddress)
          await fetchBalances()
          setMarketMakerAddress(marketMakerAddress)
          setMarketCreationStatus(MarketCreationStatus.done())
          history.replace(`/${marketMakerAddress}`)
        } else {
          setMessage('Creating categorical market...')
          const { marketMakerAddress } = await cpk.createMarket({
            marketData,
            conditionalTokens,
            realitio,
            marketMakerFactory: marketMakerFactoryV2,
          })
          await waitUntilContractDeployed(provider, marketMakerAddress)
          await fetchBalances()
          setMarketMakerAddress(marketMakerAddress)
          setMarketCreationStatus(MarketCreationStatus.done())
          history.replace(`/${marketMakerAddress}`)
        }
      }
    } catch (err) {
      console.error('error in handleSubmit', err)
    }
  }

  return (
    <>
      <MarketWizardCreator
        callback={handleSubmit}
        marketCreationStatus={marketCreationStatus}
        marketMakerAddress={marketMakerAddress}
      />
      <ModalConnectWalletWrapper isOpen={isModalOpen} onClose={() => setModalState(false)} />
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        isOpen={isTransactionModalOpen}
        message={message}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export { MarketWizardCreatorContainer }
