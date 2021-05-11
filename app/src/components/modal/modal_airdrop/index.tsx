import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import { withTheme } from 'styled-components'

import { IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft } from '../common_styled'

import { AirdropCardWrapper } from './airdrop_card'
import { ModalCheckAddressWrapper } from './check_address'
import Graphic from './graphic'

interface Props extends HTMLAttributes<HTMLDivElement> {
  theme: any
}

export const ModalAirdrop = (props: Props) => {
  const { theme } = props
  const [isOpen, setIsOpen] = useState(false)
  const [checkAddress, setCheckAddress] = useState(false)

  React.useEffect(() => {
    Modal.setAppElement('#root')

    // TODO: check localStorage for claim status
    setIsOpen(true)
  }, [])

  const onClose = () => {
    // TODO: set localStorage
    setCheckAddress(false)
    setIsOpen(false)
  }

  if (checkAddress) {
    return <ModalCheckAddressWrapper isOpen={checkAddress} onBack={() => setCheckAddress(false)} onClose={onClose} />
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalNavigationLeft></ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <Graphic />
        <AirdropCardWrapper onCheckAddress={() => setCheckAddress(true)} />
      </ContentWrapper>
    </Modal>
  )
}

export const ModalAirdropWrapper = withTheme(ModalAirdrop)
