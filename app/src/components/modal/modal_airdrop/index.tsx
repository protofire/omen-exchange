import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import {
  useAirdropService,
  useConnectedBalanceContext,
  useConnectedCPKContext,
  useConnectedWeb3Context,
} from '../../../hooks'
import { formatBigNumber } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { IconClose, IconOmen } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft } from '../common_styled'
import { ModalTransactionWrapper } from '../modal_transaction'

import { AirdropCardWrapper } from './airdrop_card'
import { ModalCheckAddressWrapper } from './check_address'
import Graphic from './graphic'

interface Props extends HTMLAttributes<HTMLDivElement> {
  theme: any
}

export const ModalAirdrop = (props: Props) => {
  const { theme } = props

  const cpk = useConnectedCPKContext()
  const { account, networkId, relay } = useConnectedWeb3Context()
  const { fetchBalances } = useConnectedBalanceContext()

  const initialIsOpenState = localStorage.getItem('airdrop')
  const [isOpen, setIsOpen] = useState(!initialIsOpenState)
  const [amount, setAmount] = useState(new BigNumber('0'))
  const [checkAddress, setCheckAddress] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [message, setMessage] = useState('')

  Modal.setAppElement('#root')

  const airdrop = useAirdropService()

  useEffect(() => {
    let active = true
    const getClaimAmount = async () => {
      const newAmount = await airdrop.getClaimAmount(account)
      if (active) {
        setAmount(newAmount)
      }
    }
    if (account) {
      getClaimAmount()
    }
    return () => {
      active = false
    }
  }, [airdrop, airdrop.relay, account, relay, networkId])

  const onClose = () => {
    localStorage.setItem('airdrop', 'displayed')
    setIsTransactionModalOpen(false)
    setCheckAddress(false)
    setIsOpen(false)
  }

  const claim = async (account: string, amount: BigNumber) => {
    if (!cpk || !account) {
      return
    }

    try {
      setMessage(`Claim ${formatBigNumber(amount, STANDARD_DECIMALS)} OMN`)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)
      await cpk.claimAirdrop({ account, setTxHash, setTxState })
      await fetchBalances()
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !amount.isZero() && !isTransactionModalOpen && !checkAddress}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={true}
        style={theme.fluidHeightModal}
      >
        <ContentWrapper>
          <ModalNavigation style={{ marginBottom: 0 }}>
            <ModalNavigationLeft />
            <IconClose hoverEffect={true} onClick={onClose} />
          </ModalNavigation>
          <Graphic />
          <AirdropCardWrapper claim={claim} displayAmount={amount} onCheckAddress={() => setCheckAddress(true)} />
        </ContentWrapper>
      </Modal>
      <ModalTransactionWrapper
        confirmations={1}
        icon={<IconOmen size={24} style={{ marginLeft: '10px' }} />}
        isOpen={isTransactionModalOpen}
        message={message}
        onClose={onClose}
        txHash={txHash}
        txState={txState}
      />
      <ModalCheckAddressWrapper
        claim={claim}
        isOpen={checkAddress && !isTransactionModalOpen}
        onBack={() => setCheckAddress(false)}
        onClose={onClose}
      />
    </>
  )
}

export const ModalAirdropWrapper = withTheme(ModalAirdrop)
