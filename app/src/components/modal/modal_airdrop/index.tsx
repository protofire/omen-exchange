import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../contexts'
import { useAirdropService } from '../../../hooks'
import { TYPE } from '../../../theme'
import { bigNumberToString } from '../../../util/tools'
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

  const { balances, cpk, setTxState, txHash, txState } = useConnectedWeb3Context()

  const initialIsOpenState = localStorage.getItem('airdrop')
  const [isOpen, setIsOpen] = useState(!initialIsOpenState)
  const [checkAddress, setCheckAddress] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [message, setMessage] = useState('')

  Modal.setAppElement('#root')

  const { claimAmount, fetchClaimAmount } = useAirdropService()

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
      setMessage(`Claim ${bigNumberToString(amount, STANDARD_DECIMALS)} OMN`)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)
      await cpk.claimAirdrop({ account })
      await fetchClaimAmount()
      await balances.fetchBalances()
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={true}
        // isOpen={isOpen && !claimAmount.isZero() && !isTransactionModalOpen && !checkAddress}
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
          <TYPE.heading2 alignItems={'center'} color={'text1'} display={'flex'} fontWeight={500} margin={'12px 0px'}>
            OMN has arrived!
          </TYPE.heading2>
          <TYPE.bodyRegular alignItems={'center'} color={'text2'} display={'flex'} margin={'12px 0px'}>
            Thanks for being part of the Omen Community.
          </TYPE.bodyRegular>
          <AirdropCardWrapper claim={claim} displayAmount={claimAmount} showCheckAddress={false} />
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
    </>
  )
}

export const ModalAirdropWrapper = withTheme(ModalAirdrop)
