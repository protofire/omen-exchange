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

const TextSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0px;
`

const DaiBanner = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.dai};
  border-radius: ${props => props.theme.cards.borderRadius};
  width: 100%;
  margin-bottom: 16px;
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
  const displayDaiBanner = parseFloat(balances.formattedxDaiBalance) === 0

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
        isOpen={isOpen && !claimAmount.isZero() && !isTransactionModalOpen && !checkAddress}
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
          <TextSection>
            <TYPE.heading2
              alignItems={'center'}
              color={'text1'}
              display={'flex'}
              fontWeight={500}
              marginBottom={'12px'}
            >
              OMN has arrived!
            </TYPE.heading2>
            <TYPE.bodyRegular alignItems={'center'} color={'text2'} display={'flex'}>
              Thanks for being part of the Omen Community.
            </TYPE.bodyRegular>
          </TextSection>
          {displayDaiBanner && (
            <DaiBanner>
              <IconExclamation color={theme.dai} />
              <TYPE.bodyRegular color={'dai'} margin={'0px 12px'} textAlign={'center'}>
                Deposit Dai in order to claim OMN tokens.
              </TYPE.bodyRegular>
            </DaiBanner>
          )}
          <AirdropCardWrapper
            claim={claim}
            displayAmount={claimAmount}
            displayCheckAddress={false}
            marginTop={!displayDaiBanner}
          />
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
