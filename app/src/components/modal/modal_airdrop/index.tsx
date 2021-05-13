import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedCPKContext } from '../../../hooks'
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

  const initialIsOpenState = localStorage.getItem('airdrop')
  const [isOpen, setIsOpen] = useState(true) // useState(!initialIsOpenState)
  const [checkAddress, setCheckAddress] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [message, setMessage] = useState('')

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

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
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !isTransactionModalOpen && !checkAddress}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={true}
        style={theme.fluidHeightModal}
      >
        <ContentWrapper>
          <ModalNavigation>
            <ModalNavigationLeft></ModalNavigationLeft>
            <IconClose hoverEffect={true} onClick={onClose} />
          </ModalNavigation>
          <Graphic />
          <AirdropCardWrapper claim={claim} onCheckAddress={() => setCheckAddress(true)} />
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
