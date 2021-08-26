import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../contexts'
import { useAirdropService } from '../../../hooks'
import { TYPE } from '../../../theme'
import { bigNumberToString } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { IconClose, IconExclamation, IconOmen } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft } from '../common_styled'
import { ModalTransactionWrapper } from '../modal_transaction'

import { AirdropCardWrapper } from './airdrop_card'
import Graphic from './graphic'

const DaiBanner = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.dai};
  border-radius: ${props => props.theme.cards.borderRadius};
  width: 100%;
`

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
  const displayDaiBanner = balances.xDaiBalance.isZero()

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
          <TYPE.heading2 color={'text1'} fontWeight={500} margin={'24px 0px 12px'}>
            OMN has arrived!
          </TYPE.heading2>
          <TYPE.bodyRegular color={'text2'} marginBottom={'32px'}>
            Thanks for being part of the Omen Community.
          </TYPE.bodyRegular>
          {displayDaiBanner && (
            <DaiBanner>
              <IconExclamation color={theme.dai} />
              <TYPE.bodyRegular color={'dai'} marginLeft={'12px'}>
                Deposit Dai in order to claim OMN tokens.
              </TYPE.bodyRegular>
            </DaiBanner>
          )}
          <AirdropCardWrapper claim={claim} displayAmount={claimAmount} displayCheckAddress={false} />
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
