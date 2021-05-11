import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { Button } from '../../button'
import { FormLabel, Textfield } from '../../common'
import { IconArrowBack, IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft, ModalTitle } from '../common_styled'

import { AirdropCardWrapper } from './airdrop_card'

const ClaimButton = styled(Button)`
  width: 100%;
  margin-top: 24px;
`

const RecipientLabelWrapper = styled.div`
  width: 100%;
  margin-top: 24px;
  margin-bottom: 12px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  theme?: any
}

export const ModalCheckAddress = (props: Props) => {
  const { isOpen, onBack, onClose, theme } = props
  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <>
      <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
        <ContentWrapper>
          <ModalNavigation>
            <ModalNavigationLeft>
              <IconArrowBack hoverEffect={true} onClick={onBack ? onBack : onClose} />
              <ModalTitle style={{ marginLeft: '16px' }}>Check Address</ModalTitle>
            </ModalNavigationLeft>
            <IconClose hoverEffect={true} onClick={onClose} />
          </ModalNavigation>
          <AirdropCardWrapper displayButtons={false} />
          <RecipientLabelWrapper>
            <FormLabel>Recipient</FormLabel>
          </RecipientLabelWrapper>
          <Textfield placeholder="Wallet Address" />
          <ClaimButton>Claim OMN</ClaimButton>
        </ContentWrapper>
      </Modal>
    </>
  )
}

export const ModalCheckAddressWrapper = withTheme(ModalCheckAddress)
