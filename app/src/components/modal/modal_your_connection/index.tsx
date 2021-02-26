import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation } from '../common_styled'

const ModalTitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textColorDark};
  font-weight: 500;
  margin: 0;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  theme?: any
}

export const ModalYourConnection = (props: Props) => {
  const { isOpen, onClose, theme } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.connectionModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalTitle>Your Connection</ModalTitle>
          <IconClose hoverEffect={true} />
        </ModalNavigation>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
